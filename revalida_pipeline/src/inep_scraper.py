"""
Lista completa e definitiva de provas e gabaritos do Revalida (INEP).
Todos os links foram confirmados manualmente.
"""
from __future__ import annotations

KNOWN_LINKS: list[dict] = [
    # ── 2014 ──
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2014/po_cinza_revalida_objetiva_2014.pdf",
     "tipo": "prova", "ano": "2014", "edicao": "1", "caderno": "cinza"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2014/gabarito_preliminar_prova_cinza_objetiva_20072014.pdf",
     "tipo": "gabarito", "ano": "2014", "edicao": "1", "caderno": "cinza"},

    # ── 2015 ──
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2015/prova_objetiva_cinza.pdf",
     "tipo": "prova", "ano": "2015", "edicao": "1", "caderno": "cinza"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2015/gabarito_definitivo_prova_cinza.pdf",
     "tipo": "gabarito", "ano": "2015", "edicao": "1", "caderno": "cinza"},

    # ── 2016 ──
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2016/prova_objetiva_1.pdf",
     "tipo": "prova", "ano": "2016", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2016/gabarito_definitivo_prova_objetiva_v1.pdf",
     "tipo": "gabarito", "ano": "2016", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2016/prova_objetiva_2.pdf",
     "tipo": "prova", "ano": "2016", "edicao": "2", "caderno": "2"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2016/gabarito_definitivo_prova_objetiva_v2.pdf",
     "tipo": "gabarito", "ano": "2016", "edicao": "2", "caderno": "2"},

    # ── 2017 ──
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2017/prova_objetiva_1.pdf",
     "tipo": "prova", "ano": "2017", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2017/gabarito_prova_objetiva1.pdf",
     "tipo": "gabarito", "ano": "2017", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2017/prova_objetiva_2.pdf",
     "tipo": "prova", "ano": "2017", "edicao": "2", "caderno": "2"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2017/gabarito_prova_objetiva2.pdf",
     "tipo": "gabarito", "ano": "2017", "edicao": "2", "caderno": "2"},

    # ── 2020 ──
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2020/revalida_obj_001_1.pdf",
     "tipo": "prova", "ano": "2020", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2020/gabarito_caderno_1.pdf",
     "tipo": "gabarito", "ano": "2020", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/provas/2020/revalida_obj_001_2.pdf",
     "tipo": "prova", "ano": "2020", "edicao": "2", "caderno": "2"},
    {"url": "https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2020/gabarito_caderno_2.pdf",
     "tipo": "gabarito", "ano": "2020", "edicao": "2", "caderno": "2"},

    # ── 2021 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2021_PV_objetiva_1.pdf",
     "tipo": "prova", "ano": "2021", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2021_GB_objetiva_1.pdf",
     "tipo": "gabarito", "ano": "2021", "edicao": "1", "caderno": "1"},

    # ── 2022 edicao 1 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2022_PV_objetiva_1.pdf",
     "tipo": "prova", "ano": "2022", "edicao": "1", "caderno": "1"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2022_GB_objetiva_1.pdf",
     "tipo": "gabarito", "ano": "2022", "edicao": "1", "caderno": "1"},

    # ── 2022 edicao 2 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2022-2_PV_objetiva.pdf",
     "tipo": "prova", "ano": "2022", "edicao": "2"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2022-2_GB_objetiva.pdf",
     "tipo": "gabarito", "ano": "2022", "edicao": "2"},

    # ── 2023 edicao 1 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_1_PV_objetiva_regular.pdf",
     "tipo": "prova", "ano": "2023", "edicao": "1"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_1_GB_objetiva_definitivo.pdf",
     "tipo": "gabarito", "ano": "2023", "edicao": "1"},

    # ── 2023 edicao 2 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_2_PV_objetiva_regular.pdf",
     "tipo": "prova", "ano": "2023", "edicao": "2"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_2_GB_objetiva.pdf",
     "tipo": "gabarito", "ano": "2023", "edicao": "2"},

    # ── 2024 edicao 1 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_1_PV_objetiva_regular.pdf",
     "tipo": "prova", "ano": "2024", "edicao": "1"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_1_GB_objetiva.pdf",
     "tipo": "gabarito", "ano": "2024", "edicao": "1"},

    # ── 2024 edicao 2 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_2_PV_objetiva_regular.pdf",
     "tipo": "prova", "ano": "2024", "edicao": "2"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_2_GB_objetiva.pdf",
     "tipo": "gabarito", "ano": "2024", "edicao": "2"},

    # ── 2025 edicao 1 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_1_PV_objetiva_regular.pdf",
     "tipo": "prova", "ano": "2025", "edicao": "1"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_1_GB_objetiva_definitivo.pdf",
     "tipo": "gabarito", "ano": "2025", "edicao": "1"},

    # ── 2025 edicao 2 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_2_caderno_1_preliminar.pdf",
     "tipo": "prova", "ano": "2025", "edicao": "2"},
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_2_gabarito_caderno_1.pdf",
     "tipo": "gabarito", "ano": "2025", "edicao": "2"},

    # ── nota gabarito 2025 ──
    {"url": "https://download.inep.gov.br/revalida/provas_e_gabaritos/nota_gabarito_enamed_revalida_2025.pdf",
     "tipo": "gabarito", "ano": "2025"},
]


def discover_inep_pdfs(extra_urls: list[str] | None = None) -> list[dict]:
    """
    Retorna a lista completa de provas e gabaritos do Revalida.
    Adiciona texto_link e pagina_origem para compatibilidade com o downloader.
    """
    result = []
    seen: set[str] = set()

    for item in KNOWN_LINKS:
        url = item["url"]
        if url in seen:
            continue
        seen.add(url)
        result.append({
            "url": url,
            "texto_link": url.split("/")[-1],
            "pagina_origem": "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/revalida/provas-e-gabaritos",
            "tipo": item["tipo"],
            "ano": item.get("ano"),
            "edicao": item.get("edicao"),
            "caderno": item.get("caderno"),
        })

    # URLs extras passadas via CLI (caso o usuário passe PDFs diretos)
    if extra_urls:
        for url in extra_urls:
            if url.lower().endswith(".pdf") and url not in seen:
                seen.add(url)
                result.append({
                    "url": url,
                    "texto_link": url.split("/")[-1],
                    "pagina_origem": url,
                    "tipo": "gabarito" if "gabarito" in url.lower() or "_GB_" in url else "prova",
                    "ano": None,
                })

    provas = [x for x in result if x["tipo"] == "prova"]
    gabaritos = [x for x in result if x["tipo"] == "gabarito"]

    from src.logger import log
    log.info(
        f"INEP: {len(provas)} provas + {len(gabaritos)} gabaritos = {len(result)} PDFs",
        etapa="inep_scraper",
    )

    return result
