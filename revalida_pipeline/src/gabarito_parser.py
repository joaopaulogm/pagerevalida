"""
Parser de gabaritos: extrai respostas corretas de PDFs de gabarito
e associa às questões já persistidas no banco.

Tabela auxiliar (não no schema principal, mas pode ser adicionada):
    gabaritos (id, prova_id, numero_questao, resposta_correta, created_at)
"""
from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from src.logger import log
from src.pdf_extractor import extract_pdf

# Padrão: "1 - A", "01. B", "1) C", "Questão 1: D"
RE_GABARITO_LINE = re.compile(
    r"""
    (?:quest[aã]o\s*)?          # "Questão" opcional
    (\d{1,3})                   # número da questão
    \s*[\.\-\)\:]\s*            # separador
    ([A-Ea-e])                  # letra da resposta
    """,
    re.IGNORECASE | re.VERBOSE,
)

# Padrão de tabela: múltiplas respostas na mesma linha
RE_GABARITO_TABLE = re.compile(
    r"(\d{1,3})\s+([A-Ea-e])",
    re.IGNORECASE,
)


@dataclass
class RespostaGabarito:
    numero_questao: int
    resposta_correta: str  # letra maiúscula


def parse_gabarito_pdf(pdf_path: str | Path) -> list[RespostaGabarito]:
    """
    Extrai respostas do gabarito de um PDF.
    Retorna lista de RespostaGabarito ordenada por número de questão.
    """
    pdf_path = Path(pdf_path)
    log.info(f"Parseando gabarito: {pdf_path.name}", etapa="gabarito")

    try:
        pdf_data = extract_pdf(pdf_path)
    except Exception as e:
        log.error(f"Erro ao extrair gabarito {pdf_path.name}: {e}", etapa="gabarito")
        return []

    respostas: dict[int, str] = {}

    for page in pdf_data.pages:
        text = page.raw_text

        # Tenta padrão linha a linha
        for m in RE_GABARITO_LINE.finditer(text):
            num = int(m.group(1))
            letra = m.group(2).upper()
            if num not in respostas:
                respostas[num] = letra

        # Tenta padrão de tabela
        if not respostas:
            for m in RE_GABARITO_TABLE.finditer(text):
                num = int(m.group(1))
                letra = m.group(2).upper()
                if num not in respostas:
                    respostas[num] = letra

    result = [
        RespostaGabarito(numero_questao=num, resposta_correta=letra)
        for num, letra in sorted(respostas.items())
    ]

    log.info(f"Gabarito: {len(result)} respostas extraídas", etapa="gabarito")
    return result


def save_gabarito_to_db(
    session,
    prova_id: str,
    respostas: list[RespostaGabarito],
):
    """
    Atualiza as alternativas no banco marcando a resposta correta.
    Adiciona coluna 'correta' se necessário (via ALTER TABLE).
    """
    from src.db import QuestaoDB, AlternativaDB
    import sqlalchemy as sa

    # Verifica se coluna 'correta' existe em alternativas
    try:
        session.execute(
            sa.text("ALTER TABLE alternativas ADD COLUMN IF NOT EXISTS correta BOOLEAN DEFAULT FALSE")
        )
        session.flush()
    except Exception:
        pass

    for resp in respostas:
        questao = (
            session.query(QuestaoDB)
            .filter_by(prova_id=uuid.UUID(prova_id), numero_questao=resp.numero_questao)
            .first()
        )
        if not questao:
            continue

        # Marca todas como incorretas primeiro
        session.query(AlternativaDB).filter_by(questao_id=questao.id).update(
            {"correta": False}
        )

        # Marca a correta
        session.query(AlternativaDB).filter_by(
            questao_id=questao.id, letra=resp.resposta_correta
        ).update({"correta": True})

    session.flush()
    log.info(
        f"Gabarito salvo: {len(respostas)} respostas para prova {prova_id}",
        etapa="gabarito",
    )
