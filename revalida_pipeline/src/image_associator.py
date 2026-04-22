"""
Associação de imagens extraídas do PDF às questões correspondentes.
Usa interseção de bbox, faixa vertical entre questões e menções textuais.
Salva imagens em disco e retorna metadados.
"""
from __future__ import annotations

import hashlib
import re
import uuid
from pathlib import Path
from typing import Optional

from slugify import slugify

from config import settings
from src.logger import log
from src.models import Bbox, ImagemQuestaoModel, QuestaoModel
from src.pdf_extractor import EmbeddedImage, PageData, PDFData, save_image_to_disk

# Palavras que indicam referência a imagem no enunciado
RE_FIGURA_MENTION = re.compile(
    r"figura|imagem|gráfico|grafico|tabela|quadro|observe|"
    r"veja|conforme|segundo\s+a\s+(?:figura|imagem|tabela)|"
    r"de\s+acordo\s+com\s+(?:a\s+)?(?:figura|imagem|tabela)|"
    r"mapa|diagrama|esquema|ilustração|ilustracao",
    re.IGNORECASE,
)

# Tipos estimados de imagem por palavras-chave
TIPO_KEYWORDS = {
    "grafico": ["gráfico", "grafico", "chart", "plot", "curva", "eixo"],
    "tabela": ["tabela", "quadro", "table"],
    "mapa": ["mapa", "map", "região", "regiao", "território"],
    "formula": ["fórmula", "formula", "equação", "equacao", "reação", "reacao"],
    "diagrama": ["diagrama", "esquema", "fluxo", "organograma"],
    "foto": ["foto", "fotografia", "imagem", "radiografia", "rx", "tomografia"],
}


def _estimate_image_type(questao_text: str) -> str:
    """Estima o tipo da imagem com base no texto da questão."""
    text_lower = questao_text.lower()
    for tipo, keywords in TIPO_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return tipo
    return "outro"


def _score_association(
    img: EmbeddedImage,
    questao: QuestaoModel,
    next_questao: Optional[QuestaoModel],
    page_height: float,
) -> float:
    """
    Calcula score de associação imagem-questão (0-1).

    Critérios:
    - Imagem na mesma página da questão: +0.3
    - Bbox da imagem intersecta bbox da questão: +0.4
    - Imagem na faixa vertical entre questão atual e próxima: +0.3
    - Questão menciona figura/imagem: +0.2
    - Imagem logo abaixo do enunciado: +0.1
    """
    score = 0.0

    q_page_start = questao.pagina_inicio or 0
    q_page_end = questao.pagina_fim or q_page_start
    next_page = next_questao.pagina_inicio if next_questao else q_page_end + 1

    # Mesma página
    if q_page_start <= img.page_num <= q_page_end:
        score += 0.3

    # Interseção de bbox
    if img.bbox and questao.bbox_principal:
        if img.bbox.intersects(questao.bbox_principal):
            score += 0.4
        else:
            # Faixa vertical: imagem abaixo da questão e acima da próxima
            q_y1 = questao.bbox_principal.y1
            next_y0 = next_questao.bbox_principal.y0 if (
                next_questao and next_questao.bbox_principal
            ) else page_height

            if q_y1 <= img.bbox.y0 <= next_y0:
                score += 0.3

    # Menção textual
    if RE_FIGURA_MENTION.search(questao.texto_completo):
        score += 0.2

    # Imagem logo abaixo do enunciado (dentro de 100 unidades)
    if img.bbox and questao.bbox_principal:
        gap = img.bbox.y0 - questao.bbox_principal.y1
        if 0 <= gap <= 100:
            score += 0.1

    return min(score, 1.0)


def associate_images(
    pdf_data: PDFData,
    questoes: list[QuestaoModel],
    prova_id: str,
    concurso: str,
) -> list[QuestaoModel]:
    """
    Associa imagens do PDF às questões e salva em disco.
    Modifica questoes in-place adicionando imagens.
    Retorna a lista de questões atualizada.
    """
    if not questoes:
        return questoes

    # Mapa de página -> imagens
    page_images: dict[int, list[EmbeddedImage]] = {}
    for page in pdf_data.pages:
        if page.images:
            page_images[page.page_num] = page.images

    # Mapa de página -> altura
    page_heights: dict[int, float] = {p.page_num: p.height for p in pdf_data.pages}

    total_images_saved = 0

    for i, questao in enumerate(questoes):
        next_questao = questoes[i + 1] if i + 1 < len(questoes) else None

        q_page_start = questao.pagina_inicio or 1
        q_page_end = questao.pagina_fim or q_page_start

        # Candidatas: imagens nas páginas da questão e página seguinte
        candidate_pages = set(range(q_page_start, q_page_end + 2))
        candidate_images: list[EmbeddedImage] = []
        for pg in candidate_pages:
            candidate_images.extend(page_images.get(pg, []))

        if not candidate_images:
            continue

        page_height = page_heights.get(q_page_start, 842.0)

        for img in candidate_images:
            score = _score_association(img, questao, next_questao, page_height)

            if score < 0.3:
                # Score muito baixo: não associa
                continue

            precisa_revisao = score < settings.min_confidence_score

            # Salva imagem em disco
            img_id = str(uuid.uuid4())
            img_filename = f"{img_id}.png"
            img_dir = (
                settings.images_dir
                / slugify(concurso)
                / prova_id
                / questao.id
            )
            img_path = img_dir / img_filename

            try:
                width, height = save_image_to_disk(img.data, img_path)
            except Exception as e:
                log.error(
                    f"Erro ao salvar imagem para questão {questao.numero_questao}: {e}",
                    etapa="image_association",
                    prova_id=prova_id,
                )
                continue

            img_hash = img.hash
            tipo_estimado = _estimate_image_type(questao.texto_completo)

            imagem_model = ImagemQuestaoModel(
                id=img_id,
                questao_id=questao.id,
                prova_id=prova_id,
                numero_pagina=img.page_num,
                caminho_arquivo=str(img_path),
                nome_arquivo=img_filename,
                mime_type="image/png",
                largura=width or img.width,
                altura=height or img.height,
                bbox=img.bbox,
                tipo_estimado=tipo_estimado,
                hash_sha256=img_hash,
                score_confianca_associacao=score,
                precisa_revisao_manual=precisa_revisao,
            )

            questao.imagens.append(imagem_model)
            questao.possui_imagem = True
            total_images_saved += 1

            log.debug(
                f"Imagem associada à questão {questao.numero_questao}: "
                f"score={score:.2f}, tipo={tipo_estimado}",
                etapa="image_association",
                prova_id=prova_id,
            )

    log.info(
        f"Total de imagens associadas: {total_images_saved} "
        f"para {len(questoes)} questões",
        etapa="image_association",
        prova_id=prova_id,
    )

    return questoes
