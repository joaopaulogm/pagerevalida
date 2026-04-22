"""
Módulo de download: descobre links de PDF em páginas HTML e baixa os arquivos.
Suporta paginação, múltiplas URLs iniciais, deduplicação por SHA-256 e retry.
"""
from __future__ import annotations

import hashlib
import re
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse
import warnings

import httpx
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
warnings.filterwarnings("ignore", message="Unverified HTTPS request")
from bs4 import BeautifulSoup
from slugify import slugify
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_fixed,
    before_sleep_log,
)
import logging

from config import settings
from src.logger import log
from src.models import ArquivoPDFModel

# Padrões de URL que indicam PDF de prova objetiva
PDF_LINK_PATTERNS = [
    re.compile(r"prova", re.I),
    re.compile(r"caderno", re.I),
    re.compile(r"questao|questão", re.I),
    re.compile(r"objetiv", re.I),
    re.compile(r"gabarito", re.I),
    re.compile(r"revalida", re.I),
    re.compile(r"\.pdf$", re.I),
]

# Padrões para EXCLUIR (gabaritos, instruções, etc. — mantemos gabaritos pois
# o usuário pediu, mas podemos filtrar depois na segmentação)
EXCLUDE_PATTERNS: list[re.Pattern] = []


def _sha256_of_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _sha256_of_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _is_pdf_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.path.lower().endswith(".pdf")


def _link_looks_like_prova(href: str, text: str) -> bool:
    combined = (href + " " + text).lower()
    return any(p.search(combined) for p in PDF_LINK_PATTERNS)


def _build_client() -> httpx.Client:
    return httpx.Client(
        headers={"User-Agent": settings.user_agent},
        timeout=settings.download_timeout,
        follow_redirects=True,
        verify=False,  # gov.br usa certificado ICP-Brasil não reconhecido pelo Python no Windows
    )


@retry(
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    stop=stop_after_attempt(settings.max_retries),
    wait=wait_fixed(settings.retry_wait),
    before_sleep=before_sleep_log(logging.getLogger("revalida_pipeline"), logging.WARNING),
    reraise=True,
)
def _fetch_page(client: httpx.Client, url: str) -> httpx.Response:
    resp = client.get(url)
    resp.raise_for_status()
    return resp


def discover_pdf_links(start_urls: list[str]) -> list[dict]:
    """
    Percorre as URLs iniciais e descobre todos os links de PDF.
    Retorna lista de dicts com {url, texto_link, pagina_origem}.
    """
    found: list[dict] = []
    visited_pages: set[str] = set()
    visited_pdfs: set[str] = set()

    with _build_client() as client:
        queue = list(start_urls)

        while queue:
            page_url = queue.pop(0)
            if page_url in visited_pages:
                continue
            visited_pages.add(page_url)

            log.info(f"Descobrindo links em: {page_url}", etapa="discovery")

            try:
                resp = _fetch_page(client, page_url)
            except Exception as e:
                log.error(f"Falha ao acessar {page_url}: {e}", etapa="discovery")
                continue

            content_type = resp.headers.get("content-type", "")
            if "pdf" in content_type or _is_pdf_url(page_url):
                # A própria URL é um PDF
                if page_url not in visited_pdfs:
                    visited_pdfs.add(page_url)
                    found.append({"url": page_url, "texto_link": "", "pagina_origem": page_url})
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            for tag in soup.find_all("a", href=True):
                href = tag["href"].strip()
                text = tag.get_text(strip=True)
                abs_url = urljoin(page_url, href)

                # Remove fragmentos
                abs_url = abs_url.split("#")[0]

                if not abs_url.startswith("http"):
                    continue

                if _is_pdf_url(abs_url):
                    if abs_url not in visited_pdfs and _link_looks_like_prova(abs_url, text):
                        visited_pdfs.add(abs_url)
                        found.append(
                            {
                                "url": abs_url,
                                "texto_link": text,
                                "pagina_origem": page_url,
                            }
                        )
                        log.debug(f"PDF encontrado: {abs_url}", etapa="discovery")

            # Procura sub-páginas de anos/abas (ex: /2023, /2024)
            for tag in soup.find_all("a", href=True):
                href = tag["href"].strip()
                abs_url = urljoin(page_url, href)
                abs_url = abs_url.split("#")[0]

                if not abs_url.startswith("http"):
                    continue
                if abs_url in visited_pages:
                    continue

                # Só segue links do mesmo domínio que pareçam ser de anos/provas
                same_domain = urlparse(abs_url).netloc == urlparse(page_url).netloc
                text = tag.get_text(strip=True)
                if same_domain and _link_looks_like_prova(abs_url, text):
                    if not _is_pdf_url(abs_url):
                        queue.append(abs_url)

    log.info(f"Total de PDFs descobertos: {len(found)}", etapa="discovery")
    return found


def _build_local_path(
    url: str,
    concurso: str,
    ano: Optional[str] = None,
    cargo: Optional[str] = None,
) -> Path:
    """Monta o caminho local: data/raw/<concurso>/<ano>/<cargo>/arquivo.pdf"""
    filename = Path(urlparse(url).path).name or "prova.pdf"
    if not filename.lower().endswith(".pdf"):
        filename += ".pdf"

    parts = [settings.raw_dir, slugify(concurso)]
    if ano:
        parts.append(str(ano))
    if cargo:
        parts.append(slugify(cargo))

    dest_dir = Path(*parts)
    dest_dir.mkdir(parents=True, exist_ok=True)
    return dest_dir / filename


@retry(
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    stop=stop_after_attempt(settings.max_retries),
    wait=wait_fixed(settings.retry_wait),
    reraise=True,
)
def _download_pdf(client: httpx.Client, url: str) -> bytes:
    resp = client.get(url)
    resp.raise_for_status()
    content_type = resp.headers.get("content-type", "")
    if "pdf" not in content_type and not _is_pdf_url(url):
        raise ValueError(f"Resposta não é PDF: content-type={content_type}")
    return resp.content


def download_pdfs(
    pdf_links: list[dict],
    concurso: str,
    ano: Optional[str] = None,
    cargo: Optional[str] = None,
    known_hashes: Optional[set[str]] = None,
    force: bool = False,
) -> list[ArquivoPDFModel]:
    """
    Baixa os PDFs descobertos, evitando duplicatas por hash SHA-256.
    Retorna lista de ArquivoPDFModel com status preenchido.
    """
    if known_hashes is None:
        known_hashes = set()

    results: list[ArquivoPDFModel] = []

    with _build_client() as client:
        for item in pdf_links:
            url = item["url"]
            log.info(f"Baixando: {url}", etapa="download")

            local_path = _build_local_path(url, concurso, ano, cargo)

            # Se arquivo já existe e não é force, verifica hash
            if local_path.exists() and not force:
                existing_hash = _sha256_of_file(local_path)
                if existing_hash in known_hashes:
                    log.info(f"Duplicado (hash já existe): {url}", etapa="download")
                    results.append(
                        ArquivoPDFModel(
                            url_origem=url,
                            nome_arquivo=local_path.name,
                            caminho_local=str(local_path),
                            hash_sha256=existing_hash,
                            tamanho_bytes=local_path.stat().st_size,
                            status_download="duplicado",
                        )
                    )
                    continue
                else:
                    log.info(f"Arquivo já existe localmente: {local_path}", etapa="download")
                    known_hashes.add(existing_hash)
                    results.append(
                        ArquivoPDFModel(
                            url_origem=url,
                            nome_arquivo=local_path.name,
                            caminho_local=str(local_path),
                            hash_sha256=existing_hash,
                            tamanho_bytes=local_path.stat().st_size,
                            status_download="baixado",
                        )
                    )
                    continue

            try:
                data = _download_pdf(client, url)
            except Exception as e:
                log.error(f"Erro ao baixar {url}: {e}", etapa="download")
                results.append(
                    ArquivoPDFModel(
                        url_origem=url,
                        nome_arquivo=Path(urlparse(url).path).name or "erro.pdf",
                        caminho_local="",
                        hash_sha256="",
                        status_download="erro",
                    )
                )
                continue

            file_hash = _sha256_of_bytes(data)

            if file_hash in known_hashes:
                log.info(f"Duplicado por hash (conteúdo idêntico): {url}", etapa="download")
                results.append(
                    ArquivoPDFModel(
                        url_origem=url,
                        nome_arquivo=local_path.name,
                        caminho_local="",
                        hash_sha256=file_hash,
                        tamanho_bytes=len(data),
                        status_download="duplicado",
                    )
                )
                continue

            # Salva o arquivo
            local_path.write_bytes(data)
            known_hashes.add(file_hash)

            log.info(
                f"PDF salvo: {local_path} ({len(data)} bytes, sha256={file_hash[:12]}...)",
                etapa="download",
            )

            results.append(
                ArquivoPDFModel(
                    url_origem=url,
                    nome_arquivo=local_path.name,
                    caminho_local=str(local_path),
                    hash_sha256=file_hash,
                    tamanho_bytes=len(data),
                    status_download="baixado",
                )
            )

            # Pequena pausa para não sobrecarregar o servidor
            time.sleep(0.5)

    return results
