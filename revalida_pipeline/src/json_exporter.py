"""
Exporta dados de uma prova para JSON intermediário de auditoria.
Formato: data/parsed/<concurso>/<prova_id>.json
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Optional

from slugify import slugify

from config import settings
from src.logger import log
from src.models import ProvaModel, QuestaoModel


def export_prova_json(
    prova: ProvaModel,
    questoes: list[QuestaoModel],
    concurso_nome: str,
    banca: Optional[str],
    ano: Optional[int],
    arquivo_pdf_nome: str,
) -> Path:
    """
    Gera o JSON intermediário de uma prova e salva em disco.
    Retorna o caminho do arquivo gerado.
    """
    output_dir = settings.parsed_dir / slugify(concurso_nome)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{prova.id}.json"

    questoes_json = []
    for q in questoes:
        alternativas_json = [
            {"letra": a.letra, "texto": a.texto}
            for a in sorted(q.alternativas, key=lambda x: x.ordem)
        ]

        imagens_json = []
        for img in q.imagens:
            bbox_dict = img.bbox.model_dump() if img.bbox else {"x0": 0, "y0": 0, "x1": 0, "y1": 0}
            imagens_json.append(
                {
                    "image_id": img.id,
                    "arquivo": img.caminho_arquivo,
                    "pagina": img.numero_pagina,
                    "bbox": bbox_dict,
                    "tipo_estimado": img.tipo_estimado,
                    "score_confianca_associacao": round(img.score_confianca_associacao, 4),
                    "precisa_revisao_manual": img.precisa_revisao_manual,
                }
            )

        bbox_dict = (
            q.bbox_principal.model_dump()
            if q.bbox_principal
            else {"x0": 0, "y0": 0, "x1": 0, "y1": 0}
        )

        questoes_json.append(
            {
                "questao_id": q.id,
                "numero_questao": q.numero_questao,
                "tipo_questao": "objetiva",
                "pagina_inicio": q.pagina_inicio,
                "pagina_fim": q.pagina_fim,
                "enunciado": q.enunciado,
                "texto_completo": q.texto_completo,
                "bbox_principal": bbox_dict,
                "score_confianca_extracao": round(q.score_confianca_extracao, 4),
                "precisa_revisao_manual": q.precisa_revisao_manual,
                "alternativas": alternativas_json,
                "imagens": imagens_json,
            }
        )

    output_data = {
        "prova_id": prova.id,
        "concurso": concurso_nome,
        "banca": banca,
        "ano": ano,
        "cargo": prova.cargo,
        "tipo_caderno": prova.tipo_caderno,
        "arquivo_pdf": arquivo_pdf_nome,
        "total_paginas": prova.total_paginas,
        "total_questoes": len(questoes_json),
        "questoes": questoes_json,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    log.info(
        f"JSON exportado: {output_path} ({len(questoes_json)} questões)",
        etapa="json_export",
        prova_id=prova.id,
    )

    return output_path
