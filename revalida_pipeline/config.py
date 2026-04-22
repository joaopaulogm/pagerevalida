"""
Configurações centralizadas via pydantic-settings + python-dotenv.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Banco de dados
    database_url: str = "postgresql://postgres:postgres@localhost:5432/revalida"

    # Diretórios
    data_dir: Path = Path("./data")
    raw_dir: Path = Path("./data/raw")
    images_dir: Path = Path("./data/images")
    parsed_dir: Path = Path("./data/parsed")
    log_file: Path = Path("./logs/pipeline.log")

    # Download
    download_timeout: int = 60
    max_retries: int = 3
    retry_wait: int = 5
    user_agent: str = "Mozilla/5.0 (compatible; RevalidaPipeline/1.0)"

    # OCR
    tesseract_cmd: str = "tesseract"
    ocr_lang: str = "por+eng"

    # Qualidade
    min_confidence_score: float = 0.7

    # Logging
    log_level: str = "INFO"

    @field_validator("raw_dir", "images_dir", "parsed_dir", "data_dir", mode="before")
    @classmethod
    def ensure_path(cls, v):
        return Path(v)

    def create_dirs(self):
        """Cria todos os diretórios necessários."""
        for d in [self.data_dir, self.raw_dir, self.images_dir, self.parsed_dir]:
            d.mkdir(parents=True, exist_ok=True)
        self.log_file.parent.mkdir(parents=True, exist_ok=True)


settings = Settings()
