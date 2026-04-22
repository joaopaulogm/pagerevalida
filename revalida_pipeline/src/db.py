"""
Camada de persistência PostgreSQL via SQLAlchemy 2.x.
Compatível com Supabase (PostgreSQL gerenciado).
"""
from __future__ import annotations

import json
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Generator, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    BigInteger,
    ForeignKey,
    UniqueConstraint,
    create_engine,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

from config import settings
from src.logger import log
from src.models import (
    AlternativaModel,
    ArquivoPDFModel,
    ConcursoModel,
    ImagemQuestaoModel,
    PaginaModel,
    ProvaModel,
    QuestaoModel,
)




def _build_connect_args() -> dict:
    """
    Parseia DATABASE_URL manualmente para evitar que urlparse
    confunda 'postgres.projectref' (usuário com ponto) com hostname.
    Formato esperado: postgresql://user:password@host:port/dbname
    """
    import re
    raw = settings.database_url.strip()
    # Remove prefixo do scheme
    raw = re.sub(r"^postgres(?:ql)?://", "", raw)
    # Remove query string
    raw = raw.split("?")[0]
    # Separa credenciais do restante: user:pass@host:port/db
    at_pos = raw.rfind("@")
    credentials = raw[:at_pos]       # user:pass
    hostpart = raw[at_pos + 1:]      # host:port/db
    # Separa user e password
    colon_pos = credentials.find(":")
    user = credentials[:colon_pos]
    password = credentials[colon_pos + 1:]
    # Separa host:port e dbname
    slash_pos = hostpart.find("/")
    host_port = hostpart[:slash_pos]
    dbname = hostpart[slash_pos + 1:]
    # Separa host e port
    if ":" in host_port:
        host, port_str = host_port.rsplit(":", 1)
        port = int(port_str)
    else:
        host = host_port
        port = 5432

    from urllib.parse import unquote
    return {
        "host": host,
        "port": port,
        "dbname": dbname,
        "user": unquote(user),
        "password": unquote(password),
        "connect_timeout": 15,
        "sslmode": "require",
    }


# ──────────────────────────────────────────────
# Engine e Session
# ──────────────────────────────────────────────

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        import psycopg2
        args = _build_connect_args()

        log.info(
            f"DB connect → host={args['host']} port={args['port']} "
            f"user={args['user']} db={args['dbname']}",
            etapa="db",
        )

        # Captura args em closure explícita para evitar problema de escopo
        _host = args["host"]
        _port = args["port"]
        _dbname = args["dbname"]
        _user = args["user"]
        _password = args["password"]
        _timeout = args["connect_timeout"]
        _ssl = args["sslmode"]

        def creator():
            return psycopg2.connect(
                host=_host,
                port=_port,
                dbname=_dbname,
                user=_user,
                password=_password,
                connect_timeout=_timeout,
                sslmode=_ssl,
            )

        _engine = create_engine(
            "postgresql+psycopg2://",
            creator=creator,
            pool_pre_ping=False,
            pool_size=3,
            max_overflow=5,
            echo=False,
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), expire_on_commit=False)
    return _SessionLocal


@contextmanager
def get_db() -> Generator[Session, None, None]:
    factory = get_session_factory()
    session: Session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# ──────────────────────────────────────────────
# ORM Models
# ──────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


class ConcursoDB(Base):
    __tablename__ = "concursos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(Text, nullable=False)
    banca = Column(Text)
    ano = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("nome", "banca", "ano", name="uq_concurso"),)

    provas = relationship("ProvaDB", back_populates="concurso")


class ArquivoPDFDB(Base):
    __tablename__ = "arquivos_pdf"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url_origem = Column(Text, nullable=False)
    nome_arquivo = Column(Text, nullable=False)
    caminho_local = Column(Text, nullable=False)
    hash_sha256 = Column(Text, nullable=False, unique=True)
    tamanho_bytes = Column(BigInteger)
    data_download = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status_download = Column(Text, nullable=False, default="pendente")


class ProvaDB(Base):
    __tablename__ = "provas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concurso_id = Column(UUID(as_uuid=True), ForeignKey("concursos.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(Text)
    cargo = Column(Text)
    turno = Column(Text)
    tipo_caderno = Column(Text)
    lingua = Column(Text, default="pt-BR")
    arquivo_pdf_id = Column(UUID(as_uuid=True), ForeignKey("arquivos_pdf.id", ondelete="SET NULL"))
    total_paginas = Column(Integer)
    hash_pdf = Column(Text)
    status_processamento = Column(Text, nullable=False, default="pendente")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    concurso = relationship("ConcursoDB", back_populates="provas")
    questoes = relationship("QuestaoDB", back_populates="prova", cascade="all, delete-orphan")
    paginas = relationship("PaginaProvaDB", back_populates="prova", cascade="all, delete-orphan")


class PaginaProvaDB(Base):
    __tablename__ = "paginas_prova"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prova_id = Column(UUID(as_uuid=True), ForeignKey("provas.id", ondelete="CASCADE"), nullable=False)
    numero_pagina = Column(Integer, nullable=False)
    texto_bruto = Column(Text)
    possui_ocr = Column(Boolean, nullable=False, default=False)
    largura = Column(Float)
    altura = Column(Float)

    __table_args__ = (UniqueConstraint("prova_id", "numero_pagina", name="uq_pagina_prova"),)

    prova = relationship("ProvaDB", back_populates="paginas")


class QuestaoDB(Base):
    __tablename__ = "questoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prova_id = Column(UUID(as_uuid=True), ForeignKey("provas.id", ondelete="CASCADE"), nullable=False)
    numero_questao = Column(Integer, nullable=False)
    tipo_questao = Column(Text, nullable=False, default="objetiva")
    pagina_inicio = Column(Integer)
    pagina_fim = Column(Integer)
    enunciado = Column(Text)
    texto_completo = Column(Text)
    possui_imagem = Column(Boolean, nullable=False, default=False)
    bbox_principal_json = Column(JSONB)
    score_confianca_extracao = Column(Float, nullable=False, default=0.0)
    precisa_revisao_manual = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("prova_id", "numero_questao", name="uq_questao_prova"),)

    prova = relationship("ProvaDB", back_populates="questoes")
    alternativas = relationship("AlternativaDB", back_populates="questao", cascade="all, delete-orphan")
    imagens = relationship("ImagemQuestaooDB", back_populates="questao", cascade="all, delete-orphan")


class AlternativaDB(Base):
    __tablename__ = "alternativas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    questao_id = Column(UUID(as_uuid=True), ForeignKey("questoes.id", ondelete="CASCADE"), nullable=False)
    letra = Column(String(1), nullable=False)
    texto = Column(Text, nullable=False)
    ordem = Column(Integer, nullable=False)

    __table_args__ = (UniqueConstraint("questao_id", "letra", name="uq_alternativa"),)

    questao = relationship("QuestaoDB", back_populates="alternativas")


class ImagemQuestaooDB(Base):
    __tablename__ = "imagens_questao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    questao_id = Column(UUID(as_uuid=True), ForeignKey("questoes.id", ondelete="CASCADE"), nullable=False)
    prova_id = Column(UUID(as_uuid=True), ForeignKey("provas.id", ondelete="CASCADE"), nullable=False)
    numero_pagina = Column(Integer, nullable=False)
    caminho_arquivo = Column(Text, nullable=False)
    nome_arquivo = Column(Text, nullable=False)
    mime_type = Column(Text, nullable=False, default="image/png")
    largura = Column(Integer)
    altura = Column(Integer)
    bbox_json = Column(JSONB)
    tipo_estimado = Column(Text)
    hash_sha256 = Column(Text, nullable=False)
    score_confianca_associacao = Column(Float, nullable=False, default=0.0)
    precisa_revisao_manual = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    questao = relationship("QuestaoDB", back_populates="imagens")


class RevisaoManualDB(Base):
    __tablename__ = "revisao_manual"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prova_id = Column(UUID(as_uuid=True), ForeignKey("provas.id", ondelete="CASCADE"))
    questao_id = Column(UUID(as_uuid=True), ForeignKey("questoes.id", ondelete="CASCADE"))
    imagem_id = Column(UUID(as_uuid=True), ForeignKey("imagens_questao.id", ondelete="CASCADE"))
    tipo_problema = Column(Text, nullable=False)
    descricao = Column(Text)
    status = Column(Text, nullable=False, default="pendente")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class LogProcessamentoDB(Base):
    __tablename__ = "logs_processamento"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prova_id = Column(UUID(as_uuid=True), ForeignKey("provas.id", ondelete="CASCADE"))
    nivel = Column(Text, nullable=False)
    etapa = Column(Text, nullable=False)
    mensagem = Column(Text, nullable=False)
    detalhes_json = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


# ──────────────────────────────────────────────
# Funções de persistência
# ──────────────────────────────────────────────

def upsert_concurso(session: Session, model: ConcursoModel) -> str:
    """Insere ou retorna concurso existente. Retorna UUID como string."""
    existing = (
        session.query(ConcursoDB)
        .filter_by(nome=model.nome, banca=model.banca, ano=model.ano)
        .first()
    )
    if existing:
        return str(existing.id)

    db_obj = ConcursoDB(
        id=uuid.UUID(model.id),
        nome=model.nome,
        banca=model.banca,
        ano=model.ano,
    )
    session.add(db_obj)
    session.flush()
    return str(db_obj.id)


def upsert_arquivo_pdf(session: Session, model: ArquivoPDFModel) -> str:
    """Insere ou retorna arquivo PDF existente por hash. Retorna UUID."""
    existing = session.query(ArquivoPDFDB).filter_by(hash_sha256=model.hash_sha256).first()
    if existing:
        return str(existing.id)

    db_obj = ArquivoPDFDB(
        id=uuid.UUID(model.id),
        url_origem=model.url_origem,
        nome_arquivo=model.nome_arquivo,
        caminho_local=model.caminho_local,
        hash_sha256=model.hash_sha256,
        tamanho_bytes=model.tamanho_bytes,
        status_download=model.status_download,
    )
    session.add(db_obj)
    session.flush()
    return str(db_obj.id)


def get_existing_hashes(session: Session) -> set[str]:
    """Retorna todos os hashes SHA-256 de PDFs já baixados."""
    rows = session.query(ArquivoPDFDB.hash_sha256).all()
    return {r[0] for r in rows}


def upsert_prova(session: Session, model: ProvaModel) -> str:
    """Insere ou atualiza prova. Retorna UUID."""
    existing = session.query(ProvaDB).filter_by(hash_pdf=model.hash_pdf).first()
    if existing:
        # Atualiza status se necessário
        if existing.status_processamento != "concluido":
            existing.status_processamento = model.status_processamento
        return str(existing.id)

    db_obj = ProvaDB(
        id=uuid.UUID(model.id),
        concurso_id=uuid.UUID(model.concurso_id),
        titulo=model.titulo,
        cargo=model.cargo,
        turno=model.turno,
        tipo_caderno=model.tipo_caderno,
        lingua=model.lingua,
        arquivo_pdf_id=uuid.UUID(model.arquivo_pdf_id) if model.arquivo_pdf_id else None,
        total_paginas=model.total_paginas,
        hash_pdf=model.hash_pdf,
        status_processamento=model.status_processamento,
    )
    session.add(db_obj)
    session.flush()
    return str(db_obj.id)


def update_prova_status(session: Session, prova_id: str, status: str):
    session.query(ProvaDB).filter_by(id=uuid.UUID(prova_id)).update(
        {"status_processamento": status}
    )


def save_paginas(session: Session, paginas: list[PaginaModel]):
    for p in paginas:
        existing = (
            session.query(PaginaProvaDB)
            .filter_by(prova_id=uuid.UUID(p.prova_id), numero_pagina=p.numero_pagina)
            .first()
        )
        if existing:
            continue
        db_obj = PaginaProvaDB(
            id=uuid.UUID(p.id),
            prova_id=uuid.UUID(p.prova_id),
            numero_pagina=p.numero_pagina,
            texto_bruto=p.texto_bruto,
            possui_ocr=p.possui_ocr,
            largura=p.largura,
            altura=p.altura,
        )
        session.add(db_obj)
    session.flush()


def save_questoes(session: Session, questoes: list[QuestaoModel]):
    """Persiste questões, alternativas e imagens. Idempotente por (prova_id, numero_questao)."""
    for q in questoes:
        existing = (
            session.query(QuestaoDB)
            .filter_by(
                prova_id=uuid.UUID(q.prova_id),
                numero_questao=q.numero_questao,
            )
            .first()
        )

        if existing:
            questao_db_id = existing.id
        else:
            bbox_json = None
            if q.bbox_principal:
                bbox_json = q.bbox_principal.model_dump()

            db_q = QuestaoDB(
                id=uuid.UUID(q.id),
                prova_id=uuid.UUID(q.prova_id),
                numero_questao=q.numero_questao,
                tipo_questao="objetiva",
                pagina_inicio=q.pagina_inicio,
                pagina_fim=q.pagina_fim,
                enunciado=q.enunciado,
                texto_completo=q.texto_completo,
                possui_imagem=q.possui_imagem,
                bbox_principal_json=bbox_json,
                score_confianca_extracao=q.score_confianca_extracao,
                precisa_revisao_manual=q.precisa_revisao_manual,
            )
            session.add(db_q)
            session.flush()
            questao_db_id = db_q.id

        # Alternativas
        for alt in q.alternativas:
            exists_alt = (
                session.query(AlternativaDB)
                .filter_by(questao_id=questao_db_id, letra=alt.letra)
                .first()
            )
            if not exists_alt:
                session.add(
                    AlternativaDB(
                        id=uuid.UUID(alt.id),
                        questao_id=questao_db_id,
                        letra=alt.letra,
                        texto=alt.texto,
                        ordem=alt.ordem,
                    )
                )

        # Imagens
        for img in q.imagens:
            exists_img = (
                session.query(ImagemQuestaooDB)
                .filter_by(hash_sha256=img.hash_sha256, questao_id=questao_db_id)
                .first()
            )
            if not exists_img:
                bbox_json = img.bbox.model_dump() if img.bbox else None
                session.add(
                    ImagemQuestaooDB(
                        id=uuid.UUID(img.id),
                        questao_id=questao_db_id,
                        prova_id=uuid.UUID(img.prova_id),
                        numero_pagina=img.numero_pagina,
                        caminho_arquivo=img.caminho_arquivo,
                        nome_arquivo=img.nome_arquivo,
                        mime_type=img.mime_type,
                        largura=img.largura,
                        altura=img.altura,
                        bbox_json=bbox_json,
                        tipo_estimado=img.tipo_estimado,
                        hash_sha256=img.hash_sha256,
                        score_confianca_associacao=img.score_confianca_associacao,
                        precisa_revisao_manual=img.precisa_revisao_manual,
                    )
                )

    session.flush()


def save_revisao_manual(
    session: Session,
    prova_id: str,
    questao_id: Optional[str],
    imagem_id: Optional[str],
    tipo_problema: str,
    descricao: str,
):
    with session.no_autoflush:
        # Verifica se questao_id existe antes de inserir
        if questao_id:
            exists = session.query(QuestaoDB).filter_by(
                id=uuid.UUID(questao_id)
            ).first()
            if not exists:
                return
        # Verifica se imagem_id existe antes de inserir
        if imagem_id:
            exists_img = session.query(ImagemQuestaooDB).filter_by(
                id=uuid.UUID(imagem_id)
            ).first()
            if not exists_img:
                imagem_id = None  # Remove referência inválida

        session.add(
            RevisaoManualDB(
                prova_id=uuid.UUID(prova_id) if prova_id else None,
                questao_id=uuid.UUID(questao_id) if questao_id else None,
                imagem_id=uuid.UUID(imagem_id) if imagem_id else None,
                tipo_problema=tipo_problema,
                descricao=descricao,
                status="pendente",
            )
        )


def save_log(
    session: Session,
    prova_id: Optional[str],
    nivel: str,
    etapa: str,
    mensagem: str,
    detalhes_json: Optional[dict] = None,
):
    session.add(
        LogProcessamentoDB(
            prova_id=uuid.UUID(prova_id) if prova_id else None,
            nivel=nivel,
            etapa=etapa,
            mensagem=mensagem,
            detalhes_json=detalhes_json,
        )
    )


def check_db_connection() -> bool:
    """Verifica se a conexão com o banco está funcionando."""
    try:
        with get_db() as session:
            session.execute(text("SELECT 1"))
        return True
    except Exception as e:
        log.error(f"Falha na conexão com o banco: {e}", etapa="db")
        return False
