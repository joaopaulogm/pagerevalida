"""
Extrai metadados da prova a partir do nome do arquivo e do texto das primeiras páginas.
Detecta: cargo, turno, tipo de caderno, ano, banca.
"""
from __future__ import annotations

import re
from typing import Optional

from src.pdf_extractor import PageData

# Padrões para extração de metadados
RE_ANO = re.compile(r"\b(20\d{2}|19\d{2})\b")
RE_TURNO = re.compile(r"\b(manh[ãa]|tarde|noite|vespertino|matutino|noturno)\b", re.I)
RE_CADERNO = re.compile(
    r"\b(caderno\s*[A-Z]|tipo\s*[A-Z1-9]|cor\s*\w+|amarelo|azul|verde|branco|rosa)\b", re.I
)
RE_CARGO = re.compile(
    r"(?:cargo|área|area|especialidade|perfil)[:\s]+([^\n\r]{3,60})", re.I
)

BANCAS_CONHECIDAS = [
    "INEP", "VUNESP", "FCC", "CESPE", "CEBRASPE", "FGV", "CESGRANRIO",
    "IBFC", "IADES", "QUADRIX", "IDECAN", "AOCP", "FEPESE", "FUNDATEC",
    "INSTITUTO AOCP", "CONSULPLAN", "MOVIMENTAR",
]


def extract_metadata_from_filename(filename: str) -> dict:
    """Extrai metadados básicos do nome do arquivo."""
    meta = {}
    name = filename.replace("_", " ").replace("-", " ")

    # Ano
    m = RE_ANO.search(name)
    if m:
        meta["ano"] = int(m.group(1))

    # Turno
    m = RE_TURNO.search(name)
    if m:
        meta["turno"] = m.group(1).capitalize()

    # Tipo de caderno
    m = RE_CADERNO.search(name)
    if m:
        meta["tipo_caderno"] = m.group(1).strip()

    return meta


def extract_metadata_from_text(pages: list[PageData], max_pages: int = 3) -> dict:
    """
    Extrai metadados das primeiras páginas do PDF.
    Analisa até max_pages páginas.
    """
    meta = {}
    combined_text = ""

    for page in pages[:max_pages]:
        combined_text += page.raw_text + "\n"

    # Ano
    if "ano" not in meta:
        m = RE_ANO.search(combined_text)
        if m:
            meta["ano"] = int(m.group(1))

    # Turno
    m = RE_TURNO.search(combined_text)
    if m:
        meta["turno"] = m.group(1).capitalize()

    # Tipo de caderno
    m = RE_CADERNO.search(combined_text)
    if m:
        meta["tipo_caderno"] = m.group(1).strip()

    # Cargo
    m = RE_CARGO.search(combined_text)
    if m:
        meta["cargo"] = m.group(1).strip()

    # Banca
    text_upper = combined_text.upper()
    for banca in BANCAS_CONHECIDAS:
        if banca in text_upper:
            meta["banca"] = banca
            break

    # Título: primeira linha não vazia com mais de 10 chars
    for line in combined_text.splitlines():
        line = line.strip()
        if len(line) > 10 and not line.isdigit():
            meta["titulo"] = line[:200]
            break

    return meta


def merge_metadata(from_filename: dict, from_text: dict) -> dict:
    """Mescla metadados, priorizando os extraídos do texto."""
    merged = {**from_filename, **from_text}
    return merged
