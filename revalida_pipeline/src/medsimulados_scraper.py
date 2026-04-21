"""
Scraper especializado para https://www.medsimulados.com/provas
Descobre links de provas por especialidade/ano e retorna lista de PDFs.
Pode ser usado como fonte alternativa ao site do INEP.
"""
from __future__ import annotations

import re
import time
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from config import settings
from src.logger import log

BASE_URL = "https://www.medsimulados.com/provas"


def _build_client() -> httpx.Client:
    return httpx.Client(
        headers={"User-Agent": settings.user_agent},
        timeout=settings.download_timeout,
        follow_redirects=True,
    )


def discover_medsimulados_pdfs(base_url: str = BASE_URL) -> list[dict]:
    """
    Percorre o site medsimulados.com/provas e coleta todos os links de PDF.
    Retorna lista de dicts {url, texto_link, pagina_origem}.
    """
    found: list[dict] = []
    visited: set[str] = set()
    pdf_urls: set[str] = set()

    with _build_client() as client:
        # Página principal
        try:
            resp = client.get(base_url)
            resp.raise_for_status()
        except Exception as e:
            log.error(f"Erro ao acessar {base_url}: {e}", etapa="medsimulados_scraper")
            return found

        soup = BeautifulSoup(resp.text, "lxml")

        # Coleta links de sub-páginas (categorias, anos, especialidades)
        sub_pages: list[str] = []
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            abs_url = urljoin(base_url, href)
            text = a.get_text(strip=True)

            if abs_url.lower().endswith(".pdf"):
                if abs_url not in pdf_urls:
                    pdf_urls.add(abs_url)
                    found.append({"url": abs_url, "texto_link": text, "pagina_origem": base_url})
            elif (
                "medsimulados.com" in abs_url
                and abs_url not in visited
                and abs_url != base_url
                and not abs_url.endswith(("#", "javascript:"))
            ):
                sub_pages.append(abs_url)

        visited.add(base_url)

        # Percorre sub-páginas
        for page_url in sub_pages:
            if page_url in visited:
                continue
            visited.add(page_url)

            try:
                resp = client.get(page_url)
                resp.raise_for_status()
            except Exception as e:
                log.warning(f"Erro ao acessar sub-página {page_url}: {e}", etapa="medsimulados_scraper")
                continue

            soup = BeautifulSoup(resp.text, "lxml")
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                abs_url = urljoin(page_url, href)
                text = a.get_text(strip=True)

                if abs_url.lower().endswith(".pdf") and abs_url not in pdf_urls:
                    pdf_urls.add(abs_url)
                    found.append({"url": abs_url, "texto_link": text, "pagina_origem": page_url})
                    log.debug(f"PDF encontrado: {abs_url}", etapa="medsimulados_scraper")

            time.sleep(0.3)

    log.info(f"medsimulados: {len(found)} PDFs encontrados", etapa="medsimulados_scraper")
    return found
