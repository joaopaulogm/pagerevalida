# Revalida Pipeline

Pipeline completo para download, extração e persistência de questões objetivas de provas em PDF.

## Estrutura do Projeto

```
revalida_pipeline/
├── .env.example
├── requirements.txt
├── schema.sql
├── main.py
├── config.py
├── src/
│   ├── __init__.py
│   ├── downloader.py       # Download e descoberta de PDFs
│   ├── pdf_extractor.py    # Extração de texto e imagens do PDF
│   ├── segmenter.py        # Segmentação de questões objetivas
│   ├── image_associator.py # Associação de imagens às questões
│   ├── db.py               # Modelos e persistência PostgreSQL
│   ├── models.py           # Modelos Pydantic
│   └── logger.py           # Logger estruturado
└── data/
    ├── raw/                # PDFs baixados
    ├── images/             # Imagens recortadas
    └── parsed/             # JSONs intermediários
```

## Instalação

```bash
pip install -r requirements.txt
```

Instale o Tesseract OCR (apenas para PDFs escaneados):
- Ubuntu: `sudo apt install tesseract-ocr tesseract-ocr-por`
- Windows: https://github.com/UB-Mannheim/tesseract/wiki
- macOS: `brew install tesseract tesseract-lang`

## Configuração

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

## Banco de Dados

```bash
psql -U postgres -d seu_banco -f schema.sql
```

## Uso

```bash
# Processar URLs específicas
python main.py --urls "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/revalida/provas-e-gabaritos"

# Múltiplas URLs
python main.py --urls "https://url1.com" "https://url2.com"

# Especificar concurso
python main.py --urls "https://..." --concurso "Revalida" --ano 2024

# Apenas baixar sem processar
python main.py --urls "https://..." --only-download

# Reprocessar mesmo se já existir
python main.py --urls "https://..." --force
```
