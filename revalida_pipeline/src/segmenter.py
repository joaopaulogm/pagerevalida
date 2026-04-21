"""
Segmentação de questões objetivas a partir dos blocos de texto extraídos do PDF.
Aplica heurísticas para identificar enunciados e alternativas A-E.
Descarta questões discursivas, redações e textos sem alternativas.
"""
from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from typing import Optional

from config import settings
from src.logger import log
from src.models import AlternativaModel, Bbox, QuestaoModel
from src.pdf_extractor import PageData, TextBlock

# ──────────────────────────────────────────────
# Padrões de detecção
# ──────────────────────────────────────────────

# Cabeçalho de questão — padrões reais do Revalida:
# "QUESTÃO 1", "Questão 01", "QUESTÃO 01 -", "1.", "01.", "1 -"
RE_QUESTAO_HEADER = re.compile(
    r"""
    (?:
        quest[aã]o\s*[nº°]?\s*0*(\d{1,3})   # "QUESTÃO 1" / "Questão 01"
        |
        ^0*(\d{1,3})\s*[\.\-\)]\s            # "1." / "01-" / "1)"
        |
        ^0*(\d{1,3})\s*$                     # número isolado na linha
    )
    """,
    re.IGNORECASE | re.VERBOSE | re.MULTILINE,
)

# Alternativa: "A)" / "A." / "(A)" / "A -" / "a)" — com texto obrigatório depois
RE_ALT_SIMPLE = re.compile(
    r"^[\(\s]*([A-Ea-e])[\)\.\-\s]\s*(.{2,})",
    re.MULTILINE,
)

# Padrões que indicam questão discursiva (excluir)
RE_DISCURSIVA = re.compile(
    r"""
    dissert|redação|redacao|disserte|explique|justifique|
    elabore|descreva|comente|analise|desenvolva|
    peça\s+jurídica|peça\s+juridica|
    estudo\s+de\s+caso|
    resposta\s+dissertativa
    """,
    re.IGNORECASE | re.VERBOSE,
)

# Palavras que indicam presença de imagem/figura
RE_FIGURA = re.compile(
    r"figura|imagem|gráfico|grafico|tabela|quadro|observe|"
    r"veja|conforme|segundo\s+a\s+(?:figura|imagem|tabela)|"
    r"de\s+acordo\s+com\s+(?:a\s+)?(?:figura|imagem|tabela)",
    re.IGNORECASE,
)

# Cabeçalhos/rodapés a ignorar
RE_HEADER_FOOTER = re.compile(
    r"""
    ^\s*(?:
        página\s*\d+|page\s*\d+|\d+\s*/\s*\d+|   # numeração de página
        (?:inep|revalida|cfm|cfmv|vunesp|fcc|     # bancas/órgãos
           cespe|cebraspe|fgv|cesgranrio|
           instituto|ministério|governo|federal)
        .*$
    )
    """,
    re.IGNORECASE | re.VERBOSE | re.MULTILINE,
)


# ──────────────────────────────────────────────
# Estrutura intermediária de questão bruta
# ──────────────────────────────────────────────

@dataclass
class RawQuestao:
    numero: int
    pagina_inicio: int
    pagina_fim: int
    blocos: list[TextBlock] = field(default_factory=list)
    alternativas_raw: list[tuple[str, str]] = field(default_factory=list)  # (letra, texto)
    bbox: Optional[Bbox] = None

    @property
    def texto_completo(self) -> str:
        return "\n".join(b.text for b in self.blocos)

    @property
    def enunciado(self) -> str:
        """Texto antes das alternativas."""
        parts = []
        for b in self.blocos:
            if RE_ALT_SIMPLE.search(b.text):
                break
            parts.append(b.text)
        return "\n".join(parts).strip()


# ──────────────────────────────────────────────
# Funções auxiliares
# ──────────────────────────────────────────────

def _extract_questao_number(text: str) -> Optional[int]:
    """Extrai o número da questão de um texto de cabeçalho."""
    m = RE_QUESTAO_HEADER.search(text)
    if not m:
        return None
    for g in m.groups():
        if g is not None:
            try:
                return int(g)
            except ValueError:
                pass
    return None


def _is_header_footer(text: str) -> bool:
    """Filtra cabeçalhos, rodapés e textos institucionais."""
    t = text.strip()
    if len(t) < 3:
        return True
    return bool(RE_HEADER_FOOTER.match(t))


def _parse_alternativas(text: str) -> list[tuple[str, str]]:
    """Extrai alternativas A-E de um bloco de texto."""
    alts: list[tuple[str, str]] = []
    seen_letters: set[str] = set()

    for m in RE_ALT_SIMPLE.finditer(text):
        letra = m.group(1).upper()
        texto = m.group(2).strip()
        if letra not in seen_letters and texto:
            seen_letters.add(letra)
            alts.append((letra, texto))

    return alts


def _compute_bbox(blocos: list[TextBlock]) -> Optional[Bbox]:
    """Calcula bbox envolvente de uma lista de blocos."""
    if not blocos:
        return None
    x0 = min(b.bbox.x0 for b in blocos)
    y0 = min(b.bbox.y0 for b in blocos)
    x1 = max(b.bbox.x1 for b in blocos)
    y1 = max(b.bbox.y1 for b in blocos)
    return Bbox(x0=x0, y0=y0, x1=x1, y1=y1)


def _score_questao(raw: RawQuestao) -> float:
    """
    Calcula score de confiança (0-1) para uma questão objetiva.
    Critérios:
    - Tem pelo menos 2 alternativas: +0.4
    - Tem pelo menos 4 alternativas: +0.2
    - Tem enunciado com mais de 20 chars: +0.2
    - Alternativas em ordem (A, B, C...): +0.1
    - Não parece discursiva: +0.1
    """
    score = 0.0
    n_alts = len(raw.alternativas_raw)

    if n_alts >= 2:
        score += 0.4
    if n_alts >= 4:
        score += 0.2

    enunciado = raw.enunciado
    if len(enunciado) > 20:
        score += 0.2

    # Verifica ordem das alternativas
    if n_alts >= 2:
        letters = [a[0] for a in raw.alternativas_raw]
        expected = [chr(ord("A") + i) for i in range(n_alts)]
        if letters == expected:
            score += 0.1

    if not RE_DISCURSIVA.search(raw.texto_completo):
        score += 0.1

    return min(score, 1.0)


# ──────────────────────────────────────────────
# Segmentador principal
# ──────────────────────────────────────────────

def segment_questoes(
    pages: list[PageData],
    prova_id: str,
    min_alternativas: int = 2,
) -> list[QuestaoModel]:
    """
    Segmenta questões objetivas a partir das páginas extraídas do PDF.

    Args:
        pages: Lista de PageData com blocos de texto.
        prova_id: UUID da prova.
        min_alternativas: Mínimo de alternativas para considerar objetiva.

    Returns:
        Lista de QuestaoModel validadas.
    """
    # Coleta todos os blocos em ordem de página/posição vertical
    all_blocks: list[TextBlock] = []
    for page in pages:
        # Ordena blocos por posição vertical (y0) e depois horizontal (x0)
        sorted_blocks = sorted(page.text_blocks, key=lambda b: (b.bbox.y0, b.bbox.x0))
        all_blocks.extend(sorted_blocks)

    if not all_blocks:
        log.warning("Nenhum bloco de texto encontrado para segmentar.", etapa="segmentacao")
        return []

    # ── Fase 1: Identificar fronteiras de questões ──
    raw_questoes: list[RawQuestao] = []
    current_raw: Optional[RawQuestao] = None

    for block in all_blocks:
        text = block.text.strip()
        if not text:
            continue

        # Ignora cabeçalhos e rodapés
        if _is_header_footer(text):
            continue

        # Verifica se é início de nova questão
        q_num = _extract_questao_number(text)

        if q_num is not None and q_num > 0:
            # Salva questão anterior
            if current_raw is not None:
                raw_questoes.append(current_raw)

            current_raw = RawQuestao(
                numero=q_num,
                pagina_inicio=block.page_num,
                pagina_fim=block.page_num,
                blocos=[block],
            )
        elif current_raw is not None:
            current_raw.blocos.append(block)
            current_raw.pagina_fim = block.page_num

    # Adiciona última questão
    if current_raw is not None:
        raw_questoes.append(current_raw)

    log.info(f"Questões brutas identificadas: {len(raw_questoes)}", etapa="segmentacao")

    # ── Fase 2: Extrair alternativas e filtrar objetivas ──
    questoes_finais: list[QuestaoModel] = []

    for raw in raw_questoes:
        texto_completo = raw.texto_completo

        # Extrai alternativas do texto completo
        alts = _parse_alternativas(texto_completo)
        raw.alternativas_raw = alts

        # Filtra discursivas
        if RE_DISCURSIVA.search(texto_completo):
            log.debug(
                f"Questão {raw.numero} descartada: parece discursiva.",
                etapa="segmentacao",
            )
            continue

        # Verifica mínimo de alternativas
        if len(alts) < min_alternativas:
            log.debug(
                f"Questão {raw.numero} descartada: apenas {len(alts)} alternativa(s).",
                etapa="segmentacao",
            )
            continue

        # Calcula score
        score = _score_questao(raw)
        precisa_revisao = score < settings.min_confidence_score

        # Monta bbox principal
        bbox = _compute_bbox(raw.blocos)

        # Detecta menção a imagem
        possui_imagem = bool(RE_FIGURA.search(texto_completo))

        # Monta alternativas
        alternativas_models = [
            AlternativaModel(
                questao_id="",  # será preenchido após criar QuestaoModel
                letra=letra,
                texto=texto,
                ordem=i,
            )
            for i, (letra, texto) in enumerate(alts)
        ]

        questao = QuestaoModel(
            id=str(uuid.uuid4()),
            prova_id=prova_id,
            numero_questao=raw.numero,
            tipo_questao="objetiva",
            pagina_inicio=raw.pagina_inicio,
            pagina_fim=raw.pagina_fim,
            enunciado=raw.enunciado,
            texto_completo=texto_completo,
            possui_imagem=possui_imagem,
            bbox_principal=bbox,
            score_confianca_extracao=score,
            precisa_revisao_manual=precisa_revisao,
            alternativas=[],
        )

        # Atualiza questao_id nas alternativas
        for alt in alternativas_models:
            alt.questao_id = questao.id
        questao.alternativas = alternativas_models

        questoes_finais.append(questao)

        log.debug(
            f"Questão {raw.numero} aceita: {len(alts)} alternativas, score={score:.2f}",
            etapa="segmentacao",
        )

    log.info(
        f"Questões objetivas extraídas: {len(questoes_finais)} "
        f"(de {len(raw_questoes)} brutas)",
        etapa="segmentacao",
    )

    return questoes_finais
