"""
Logger estruturado com suporte a arquivo e console.
Persiste logs críticos no banco de dados via callback opcional.
"""
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Callable

from config import settings


class JSONFormatter(logging.Formatter):
    """Formata logs como JSON estruturado."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "etapa": getattr(record, "etapa", "geral"),
            "prova_id": getattr(record, "prova_id", None),
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "extra_data"):
            log_obj["details"] = record.extra_data
        return json.dumps(log_obj, ensure_ascii=False)


class PipelineLogger:
    """Logger principal do pipeline com suporte a contexto de prova."""

    def __init__(self, name: str = "revalida_pipeline"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
        self._db_callback: Optional[Callable] = None

        if not self.logger.handlers:
            self._setup_handlers()

    def _setup_handlers(self):
        # Console handler com formato legível
        console = logging.StreamHandler(sys.stdout)
        console.setFormatter(
            logging.Formatter(
                "%(asctime)s [%(levelname)s] %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        self.logger.addHandler(console)

        # File handler com JSON estruturado
        try:
            settings.log_file.parent.mkdir(parents=True, exist_ok=True)
            file_handler = logging.FileHandler(settings.log_file, encoding="utf-8")
            file_handler.setFormatter(JSONFormatter())
            self.logger.addHandler(file_handler)
        except Exception as e:
            self.logger.warning(f"Não foi possível criar log em arquivo: {e}")

    def set_db_callback(self, callback: Callable):
        """Define callback para persistir logs no banco."""
        self._db_callback = callback

    def _log(
        self,
        level: str,
        message: str,
        etapa: str = "geral",
        prova_id: Optional[str] = None,
        extra_data: Optional[dict] = None,
    ):
        extra = {"etapa": etapa, "prova_id": prova_id}
        if extra_data:
            extra["extra_data"] = extra_data

        log_fn = getattr(self.logger, level.lower())
        log_fn(message, extra=extra)

        # Persiste no banco se callback configurado
        if self._db_callback and level.upper() in ("WARNING", "ERROR", "CRITICAL"):
            try:
                self._db_callback(
                    prova_id=prova_id,
                    nivel=level.upper(),
                    etapa=etapa,
                    mensagem=message,
                    detalhes_json=extra_data,
                )
            except Exception:
                pass  # Não deixar falha de log quebrar o pipeline

    def info(self, msg: str, etapa: str = "geral", prova_id: str = None, **kw):
        self._log("INFO", msg, etapa, prova_id, kw or None)

    def debug(self, msg: str, etapa: str = "geral", prova_id: str = None, **kw):
        self._log("DEBUG", msg, etapa, prova_id, kw or None)

    def warning(self, msg: str, etapa: str = "geral", prova_id: str = None, **kw):
        self._log("WARNING", msg, etapa, prova_id, kw or None)

    def error(self, msg: str, etapa: str = "geral", prova_id: str = None, **kw):
        self._log("ERROR", msg, etapa, prova_id, kw or None)

    def critical(self, msg: str, etapa: str = "geral", prova_id: str = None, **kw):
        self._log("CRITICAL", msg, etapa, prova_id, kw or None)


# Instância global
log = PipelineLogger()
