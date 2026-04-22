"""
Modelos Pydantic para validação e serialização dos dados do pipeline.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ──────────────────────────────────────────────
# Bbox
# ──────────────────────────────────────────────
class Bbox(BaseModel):
    x0: float
    y0: float
    x1: float
    y1: float

    @property
    def area(self) -> float:
        return max(0.0, self.x1 - self.x0) * max(0.0, self.y1 - self.y0)

    def intersects(self, other: "Bbox") -> bool:
        return (
            self.x0 < other.x1
            and self.x1 > other.x0
            and self.y0 < other.y1
            and self.y1 > other.y0
        )

    def intersection_area(self, other: "Bbox") -> float:
        ix0 = max(self.x0, other.x0)
        iy0 = max(self.y0, other.y0)
        ix1 = min(self.x1, other.x1)
        iy1 = min(self.y1, other.y1)
        return max(0.0, ix1 - ix0) * max(0.0, iy1 - iy0)


# ──────────────────────────────────────────────
# Alternativa
# ──────────────────────────────────────────────
class AlternativaModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    questao_id: str
    letra: str
    texto: str
    ordem: int


# ──────────────────────────────────────────────
# Imagem de Questão
# ──────────────────────────────────────────────
class ImagemQuestaoModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    questao_id: str
    prova_id: str
    numero_pagina: int
    caminho_arquivo: str
    nome_arquivo: str
    mime_type: str = "image/png"
    largura: Optional[int] = None
    altura: Optional[int] = None
    bbox: Optional[Bbox] = None
    tipo_estimado: Optional[str] = None
    hash_sha256: str = ""
    score_confianca_associacao: float = 0.0
    precisa_revisao_manual: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("tipo_estimado")
    @classmethod
    def validate_tipo(cls, v):
        allowed = {"foto", "grafico", "tabela", "diagrama", "formula", "mapa", "outro", None}
        if v not in allowed:
            return "outro"
        return v


# ──────────────────────────────────────────────
# Questão
# ──────────────────────────────────────────────
class QuestaoModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prova_id: str
    numero_questao: int
    tipo_questao: str = "objetiva"
    pagina_inicio: Optional[int] = None
    pagina_fim: Optional[int] = None
    enunciado: str = ""
    texto_completo: str = ""
    possui_imagem: bool = False
    bbox_principal: Optional[Bbox] = None
    score_confianca_extracao: float = 0.0
    precisa_revisao_manual: bool = False
    alternativas: list[AlternativaModel] = Field(default_factory=list)
    imagens: list[ImagemQuestaoModel] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("tipo_questao")
    @classmethod
    def must_be_objetiva(cls, v):
        if v != "objetiva":
            raise ValueError("Apenas questões objetivas são permitidas")
        return v


# ──────────────────────────────────────────────
# Página
# ──────────────────────────────────────────────
class PaginaModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prova_id: str
    numero_pagina: int
    texto_bruto: str = ""
    possui_ocr: bool = False
    largura: Optional[float] = None
    altura: Optional[float] = None


# ──────────────────────────────────────────────
# Prova
# ──────────────────────────────────────────────
class ProvaModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    concurso_id: str
    titulo: Optional[str] = None
    cargo: Optional[str] = None
    turno: Optional[str] = None
    tipo_caderno: Optional[str] = None
    lingua: str = "pt-BR"
    arquivo_pdf_id: Optional[str] = None
    total_paginas: Optional[int] = None
    hash_pdf: Optional[str] = None
    status_processamento: str = "pendente"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    questoes: list[QuestaoModel] = Field(default_factory=list)
    paginas: list[PaginaModel] = Field(default_factory=list)


# ──────────────────────────────────────────────
# Arquivo PDF
# ──────────────────────────────────────────────
class ArquivoPDFModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url_origem: str
    nome_arquivo: str
    caminho_local: str
    hash_sha256: str
    tamanho_bytes: Optional[int] = None
    data_download: datetime = Field(default_factory=datetime.utcnow)
    status_download: str = "pendente"


# ──────────────────────────────────────────────
# Concurso
# ──────────────────────────────────────────────
class ConcursoModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    banca: Optional[str] = None
    ano: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ──────────────────────────────────────────────
# JSON intermediário de prova
# ──────────────────────────────────────────────
class ProvaJSON(BaseModel):
    prova_id: str
    concurso: str
    banca: Optional[str]
    ano: Optional[int]
    cargo: Optional[str]
    tipo_caderno: Optional[str]
    arquivo_pdf: str
    questoes: list[dict] = Field(default_factory=list)
