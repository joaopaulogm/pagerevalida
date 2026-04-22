"""
Pipeline principal: orquestra download, extração, segmentação,
associação de imagens, persistência e exportação JSON.

Uso:
    python main.py --urls "https://..." --concurso "Revalida" --ano 2024
    python main.py --urls "https://url1" "https://url2" --force
    python main.py --urls "https://..." --only-download
"""
from __future__ import annotations

import argparse
import sys
import uuid
from pathlib import Path

# Garante que o diretório raiz está no path
sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from src.db import (
    check_db_connection,
    get_db,
    get_existing_hashes,
    save_log,
    save_paginas,
    save_questoes,
    save_revisao_manual,
    update_prova_status,
    upsert_arquivo_pdf,
    upsert_concurso,
    upsert_prova,
)
from src.downloader import discover_pdf_links, download_pdfs
from src.image_associator import associate_images
from src.inep_scraper import discover_inep_pdfs
from src.json_exporter import export_prova_json
from src.logger import log
from src.metadata_extractor import (
    extract_metadata_from_filename,
    extract_metadata_from_text,
    merge_metadata,
)
from src.models import ConcursoModel, PaginaModel, ProvaModel
from src.pdf_extractor import extract_pdf
from src.segmenter import segment_questoes


# ──────────────────────────────────────────────
# Callback de log para banco de dados
# ──────────────────────────────────────────────

def _make_db_log_callback(prova_id_ref: list):
    """Cria callback que persiste logs WARNING+ no banco."""
    def callback(prova_id, nivel, etapa, mensagem, detalhes_json):
        pid = prova_id or (prova_id_ref[0] if prova_id_ref else None)
        try:
            with get_db() as session:
                save_log(
                    session,
                    prova_id=pid,
                    nivel=nivel,
                    etapa=etapa,
                    mensagem=mensagem,
                    detalhes_json=detalhes_json,
                )
        except Exception:
            pass
    return callback


# ──────────────────────────────────────────────
# Processamento de um PDF
# ──────────────────────────────────────────────

def process_pdf(
    arquivo_model,
    concurso_id: str,
    concurso_nome: str,
    banca: str | None,
    ano: int | None,
    force: bool = False,
) -> bool:
    """
    Processa um único PDF: extrai, segmenta, associa imagens, persiste.
    Retorna True se processado com sucesso.
    """
    pdf_path = Path(arquivo_model.caminho_local)
    if not pdf_path.exists():
        log.error(f"Arquivo não encontrado: {pdf_path}", etapa="process_pdf")
        return False

    prova_id_ref = [None]
    log.set_db_callback(_make_db_log_callback(prova_id_ref))

    # ── 1. Verifica se já foi processado ──
    with get_db() as session:
        from src.db import ProvaDB
        import sqlalchemy as sa
        existing = session.query(ProvaDB).filter_by(
            hash_pdf=arquivo_model.hash_sha256
        ).first()
        if existing and existing.status_processamento == "concluido" and not force:
            log.info(
                f"PDF já processado (prova_id={existing.id}): {pdf_path.name}",
                etapa="process_pdf",
            )
            return True

    # ── 2. Extrai metadados ──
    meta_filename = extract_metadata_from_filename(pdf_path.name)

    # ── 3. Extrai PDF ──
    log.info(f"Iniciando extração: {pdf_path.name}", etapa="process_pdf")
    try:
        pdf_data = extract_pdf(pdf_path)
    except Exception as e:
        log.error(f"Falha na extração do PDF {pdf_path.name}: {e}", etapa="process_pdf")
        return False

    meta_text = extract_metadata_from_text(pdf_data.pages)
    meta = merge_metadata(meta_filename, meta_text)

    # ── 4. Cria/atualiza prova no banco ──
    prova_model = ProvaModel(
        id=str(uuid.uuid4()),
        concurso_id=concurso_id,
        titulo=meta.get("titulo"),
        cargo=meta.get("cargo"),
        turno=meta.get("turno"),
        tipo_caderno=meta.get("tipo_caderno"),
        arquivo_pdf_id=arquivo_model.id,
        total_paginas=pdf_data.total_pages,
        hash_pdf=arquivo_model.hash_sha256,
        status_processamento="processando",
    )

    with get_db() as session:
        prova_id = upsert_prova(session, prova_model)
        prova_model.id = prova_id
        prova_id_ref[0] = prova_id

    log.info(f"Prova registrada: {prova_id}", etapa="process_pdf")

    # ── 5. Persiste páginas ──
    paginas = [
        PaginaModel(
            prova_id=prova_id,
            numero_pagina=p.page_num,
            texto_bruto=p.raw_text,
            possui_ocr=p.used_ocr,
            largura=p.width,
            altura=p.height,
        )
        for p in pdf_data.pages
    ]
    with get_db() as session:
        save_paginas(session, paginas)

    # ── 6. Segmenta questões ──
    log.info("Segmentando questões objetivas...", etapa="process_pdf", prova_id=prova_id)
    questoes = segment_questoes(pdf_data.pages, prova_id=prova_id)

    if not questoes:
        log.warning(
            f"Nenhuma questão objetiva encontrada em {pdf_path.name}",
            etapa="process_pdf",
            prova_id=prova_id,
        )
        with get_db() as session:
            update_prova_status(session, prova_id, "concluido")
            save_log(
                session,
                prova_id=prova_id,
                nivel="WARNING",
                etapa="segmentacao",
                mensagem="Nenhuma questão objetiva encontrada",
                detalhes_json={"arquivo": pdf_path.name},
            )
        return True

    # ── 7. Associa imagens ──
    log.info("Associando imagens às questões...", etapa="process_pdf", prova_id=prova_id)
    questoes = associate_images(
        pdf_data=pdf_data,
        questoes=questoes,
        prova_id=prova_id,
        concurso=concurso_nome,
    )

    # ── 8. Persiste questões ──
    log.info(f"Persistindo {len(questoes)} questões...", etapa="process_pdf", prova_id=prova_id)
    with get_db() as session:
        save_questoes(session, questoes)

    # ── 9. Registra pendências de revisão manual (após commit das questões) ──
    with get_db() as session:
        for q in questoes:
            if q.precisa_revisao_manual:
                save_revisao_manual(
                    session,
                    prova_id=prova_id,
                    questao_id=q.id,
                    imagem_id=None,
                    tipo_problema="baixo_score_extracao",
                    descricao=f"Score de extração: {q.score_confianca_extracao:.2f}",
                )
            for img in q.imagens:
                if img.precisa_revisao_manual:
                    save_revisao_manual(
                        session,
                        prova_id=prova_id,
                        questao_id=q.id,
                        imagem_id=img.id,
                        tipo_problema="baixo_score_associacao",
                        descricao=f"Score de associação: {img.score_confianca_associacao:.2f}",
                    )

    # ── 10. Exporta JSON intermediário ──
    prova_model.id = prova_id
    prova_model.total_paginas = pdf_data.total_pages
    export_prova_json(
        prova=prova_model,
        questoes=questoes,
        concurso_nome=concurso_nome,
        banca=banca,
        ano=ano or meta.get("ano"),
        arquivo_pdf_nome=pdf_path.name,
    )

    # ── 11. Marca como concluído ──
    with get_db() as session:
        update_prova_status(session, prova_id, "concluido")
        save_log(
            session,
            prova_id=prova_id,
            nivel="INFO",
            etapa="conclusao",
            mensagem=f"Processamento concluído: {len(questoes)} questões objetivas",
            detalhes_json={
                "total_questoes": len(questoes),
                "total_imagens": sum(len(q.imagens) for q in questoes),
                "revisao_manual": sum(1 for q in questoes if q.precisa_revisao_manual),
            },
        )

    log.info(
        f"✓ {pdf_path.name}: {len(questoes)} questões, "
        f"{sum(len(q.imagens) for q in questoes)} imagens",
        etapa="process_pdf",
        prova_id=prova_id,
    )
    return True


# ──────────────────────────────────────────────
# Pipeline completo
# ──────────────────────────────────────────────

def run_pipeline(
    urls: list[str],
    concurso: str,
    ano: int | None = None,
    cargo: str | None = None,
    banca: str | None = None,
    only_download: bool = False,
    force: bool = False,
):
    settings.create_dirs()

    log.info("=" * 60, etapa="pipeline")
    log.info(f"Iniciando pipeline: concurso={concurso}, ano={ano}", etapa="pipeline")
    log.info(f"URLs: {urls}", etapa="pipeline")

    # ── Verifica banco ──
    if not only_download:
        if not check_db_connection():
            log.error(
                "Não foi possível conectar ao banco de dados. "
                "Verifique DATABASE_URL no .env",
                etapa="pipeline",
            )
            sys.exit(1)

    # ── Cria/obtém concurso ──
    concurso_model = ConcursoModel(
        nome=concurso,
        banca=banca,
        ano=ano,
    )
    concurso_id = None
    if not only_download:
        with get_db() as session:
            concurso_id = upsert_concurso(session, concurso_model)
        log.info(f"Concurso: {concurso} (id={concurso_id})", etapa="pipeline")

    # ── Descobre PDFs ──
    log.info("Descobrindo links de PDF...", etapa="pipeline")

    # Usa scraper dedicado do INEP quando banca for INEP/Revalida
    use_inep_scraper = banca and "INEP" in banca.upper()

    if use_inep_scraper:
        log.info("Usando scraper dedicado INEP (download.inep.gov.br)...", etapa="pipeline")
        inep_items = discover_inep_pdfs(extra_urls=urls)
        # Separa provas de gabaritos
        pdf_links = [x for x in inep_items if x["tipo"] == "prova"]
        gabarito_links = [x for x in inep_items if x["tipo"] == "gabarito"]
        log.info(
            f"INEP scraper: {len(pdf_links)} provas + {len(gabarito_links)} gabaritos",
            etapa="pipeline",
        )
    else:
        pdf_links = discover_pdf_links(urls)
        gabarito_links = []

    if not pdf_links and not gabarito_links:
        log.warning("Nenhum PDF encontrado nas URLs fornecidas.", etapa="pipeline")
        return

    log.info(f"{len(pdf_links)} provas + {len(gabarito_links)} gabaritos encontrados.", etapa="pipeline")

    # ── Obtém hashes já conhecidos ──
    known_hashes: set[str] = set()
    if not only_download and not force:
        with get_db() as session:
            known_hashes = get_existing_hashes(session)

    # ── Baixa PDFs de provas ──
    log.info("Baixando PDFs de provas...", etapa="pipeline")
    arquivos = download_pdfs(
        pdf_links=pdf_links,
        concurso=concurso,
        ano=str(ano) if ano else None,
        cargo=cargo,
        known_hashes=known_hashes,
        force=force,
    )

    # ── Baixa gabaritos (subpasta gabaritos/) ──
    if gabarito_links:
        log.info("Baixando PDFs de gabaritos...", etapa="pipeline")
        arquivos_gabarito = download_pdfs(
            pdf_links=gabarito_links,
            concurso=concurso + "_gabaritos",
            ano=str(ano) if ano else None,
            cargo=cargo,
            known_hashes=known_hashes,
            force=force,
        )
        log.info(
            f"Gabaritos: {sum(1 for a in arquivos_gabarito if a.status_download == 'baixado')} baixados",
            etapa="pipeline",
        )

    baixados = [a for a in arquivos if a.status_download == "baixado"]
    duplicados = [a for a in arquivos if a.status_download == "duplicado"]
    erros = [a for a in arquivos if a.status_download == "erro"]

    log.info(
        f"Download: {len(baixados)} baixados, {len(duplicados)} duplicados, {len(erros)} erros",
        etapa="pipeline",
    )

    if only_download:
        log.info("Modo --only-download: encerrando após downloads.", etapa="pipeline")
        return

    # ── Persiste arquivos PDF ──
    with get_db() as session:
        for arq in arquivos:
            if arq.status_download in ("baixado", "duplicado") and arq.hash_sha256:
                arq.id = upsert_arquivo_pdf(session, arq)

    # ── Processa cada PDF ──
    processados = 0
    falhas = 0

    for arq in arquivos:
        if arq.status_download not in ("baixado",):
            continue
        if not arq.caminho_local:
            continue

        success = process_pdf(
            arquivo_model=arq,
            concurso_id=concurso_id,
            concurso_nome=concurso,
            banca=banca,
            ano=ano,
            force=force,
        )
        if success:
            processados += 1
        else:
            falhas += 1

    log.info("=" * 60, etapa="pipeline")
    log.info(
        f"Pipeline concluído: {processados} processados, {falhas} falhas",
        etapa="pipeline",
    )


# ──────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(
        description="Pipeline de extração de questões objetivas de provas em PDF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python main.py --urls "https://www.gov.br/inep/.../revalida/provas-e-gabaritos"
  python main.py --urls "https://url1" "https://url2" --concurso "Revalida" --ano 2024
  python main.py --urls "https://..." --only-download
  python main.py --urls "https://..." --force
        """,
    )
    parser.add_argument(
        "--urls",
        nargs="+",
        required=True,
        help="Uma ou mais URLs para descoberta de PDFs",
    )
    parser.add_argument(
        "--concurso",
        default="Revalida",
        help="Nome do concurso (default: Revalida)",
    )
    parser.add_argument(
        "--ano",
        type=int,
        default=None,
        help="Ano do concurso (opcional)",
    )
    parser.add_argument(
        "--cargo",
        default=None,
        help="Cargo/área (opcional, usado na organização de pastas)",
    )
    parser.add_argument(
        "--banca",
        default="INEP",
        help="Banca organizadora (default: INEP)",
    )
    parser.add_argument(
        "--only-download",
        action="store_true",
        help="Apenas baixa os PDFs sem processar",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Reprocessa mesmo que já exista no banco",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(
        urls=args.urls,
        concurso=args.concurso,
        ano=args.ano,
        cargo=args.cargo,
        banca=args.banca,
        only_download=args.only_download,
        force=args.force,
    )
