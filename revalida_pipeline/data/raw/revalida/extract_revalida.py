#!/usr/bin/env python3
"""
Revalida Pipeline - PDF Extraction Script
Extracts questions, curriculum matrix, style analysis, and answer keys from Revalida PDFs.
"""

import json
import re
import os
import sys
from pathlib import Path
from datetime import datetime

# ─── Dependency check ───────────────────────────────────────────────────────
try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    os.system(f"{sys.executable} -m pip install pdfplumber")
    import pdfplumber

try:
    import fitz  # PyMuPDF - for image extraction
except ImportError:
    print("Installing PyMuPDF...")
    os.system(f"{sys.executable} -m pip install PyMuPDF")
    import fitz

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
GABARITOS_DIR = BASE_DIR.parent / "revalida-gabaritos"
OUTPUT_DIR = BASE_DIR.parent.parent / "processed" / "revalida"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

QUESTIONS_DIR = OUTPUT_DIR / "questoes"
QUESTIONS_DIR.mkdir(parents=True, exist_ok=True)

# ─── Exam file mapping ────────────────────────────────────────────────────────
# Maps PDF filename → (year, edition, caderno)
EXAM_FILE_MAP = {
    "2021_PV_objetiva_1.pdf":           (2021, 1, "1"),
    "2022_PV_objetiva_1.pdf":           (2022, 1, "1"),
    "2022-2_PV_objetiva.pdf":           (2022, 2, "1"),
    "2023_1_PV_objetiva_regular.pdf":   (2023, 1, "1"),
    "2023_2_PV_objetiva_regular.pdf":   (2023, 2, "1"),
    "2024_1_PV_objetiva_regular.pdf":   (2024, 1, "1"),
    "2024_2_PV_objetiva_regular.pdf":   (2024, 2, "1"),
    "2025_1_PV_objetiva_regular.pdf":   (2025, 1, "1"),
    "2025_2_caderno_1_preliminar.pdf":  (2025, 2, "1"),
    "po_cinza_revalida_objetiva_2014.pdf": (2014, 1, "cinza"),
    "prova_objetiva_1.pdf":             (2015, 1, "1"),
    "prova_objetiva_2.pdf":             (2015, 1, "2"),
    "prova_objetiva_cinza.pdf":         (2016, 1, "cinza"),
    "revalida_obj_001_1.pdf":           (2017, 1, "1"),
    "revalida_obj_001_2.pdf":           (2017, 1, "2"),
}

GABARITO_FILE_MAP = {
    "2021_GB_objetiva_1.pdf":                      (2021, 1, "1"),
    "2022_GB_objetiva_1.pdf":                      (2022, 1, "1"),
    "2022-2_GB_objetiva.pdf":                      (2022, 2, "1"),
    "2023_1_GB_objetiva_definitivo.pdf":           (2023, 1, "1"),
    "2023_2_GB_objetiva.pdf":                      (2023, 2, "1"),
    "2024_1_GB_objetiva.pdf":                      (2024, 1, "1"),
    "2024_2_GB_objetiva.pdf":                      (2024, 2, "1"),
    "2025_1_GB_objetiva_definitivo.pdf":           (2025, 1, "1"),
    "2025_2_gabarito_caderno_1.pdf":               (2025, 2, "1"),
    "gabarito_caderno_1.pdf":                      (2015, 1, "1"),
    "gabarito_caderno_2.pdf":                      (2015, 1, "2"),
    "gabarito_definitivo_prova_cinza.pdf":         (2016, 1, "cinza"),
    "gabarito_definitivo_prova_objetiva_v1.pdf":   (2016, 1, "1"),
    "gabarito_definitivo_prova_objetiva_v2.pdf":   (2016, 1, "2"),
    "gabarito_preliminar_prova_cinza_objetiva_20072014.pdf": (2014, 1, "cinza"),
    "gabarito_prova_objetiva1.pdf":                (2017, 1, "1"),
    "gabarito_prova_objetiva2.pdf":                (2017, 1, "2"),
    # nota_gabarito_enamed_revalida_2025.pdf is a note, not a gabarito
}

# ─── PDF text extraction ──────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract full text from PDF using pdfplumber."""
    text_parts = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text(layout=True) or ""
                text_parts.append(page_text)
    except Exception as e:
        print(f"  [WARN] pdfplumber failed for {pdf_path.name}: {e}")
    return "\n".join(text_parts)

def extract_text_by_page(pdf_path: Path) -> list[dict]:
    """Extract text page-by-page with metadata."""
    pages = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                text = page.extract_text(layout=True) or ""
                pages.append({"page": i, "text": text})
    except Exception as e:
        print(f"  [WARN] {pdf_path.name}: {e}")
    return pages

# ─── Question parser ──────────────────────────────────────────────────────────

# Patterns for question headers (Portuguese exam style)
QUESTION_PATTERNS = [
    # "QUESTÃO 01" or "Questão 1" or "QUESTÃO  01"
    r'(?i)QUEST[ÃA]O\s+(\d{1,3})',
    # "Q 01" or "Q01"
    r'(?i)\bQ\.?\s*(\d{1,3})\b(?=\s)',
    # numbered "(01)" or "01." at line start
    r'^\s*(?:\()?(\d{1,3})(?:\))?\s*[\.–\-]',
]

OPTION_PATTERN = re.compile(
    r'^\s*([A-Ea-e])\s*[\.\)\-]\s+(.+)',
    re.MULTILINE
)

QUESTION_START_RE = re.compile(
    r'(?i)QUEST[ÃA]O\s+(\d{1,3})',
    re.MULTILINE
)

def clean_text(text: str) -> str:
    """Normalize whitespace and remove artifacts."""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\S\n]+', ' ', text)
    text = text.strip()
    return text

def parse_options(block: str) -> dict:
    """Parse multiple-choice options from a question block."""
    options = {}
    for match in OPTION_PATTERN.finditer(block):
        letter = match.group(1).upper()
        content = clean_text(match.group(2))
        options[letter] = content
    return options

def split_into_questions(full_text: str) -> list[dict]:
    """
    Split the full PDF text into individual question blocks.
    Returns list of dicts with number, statement, options, raw_text.
    """
    questions = []

    # Find all question markers
    matches = list(QUESTION_START_RE.finditer(full_text))
    if not matches:
        print("  [WARN] No question markers found with primary pattern.")
        return []

    for i, match in enumerate(matches):
        q_num = int(match.group(1))
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        block = full_text[start:end].strip()

        # Extract the header line and body
        lines = block.split('\n')
        header = lines[0].strip()
        body_lines = lines[1:]
        body = '\n'.join(body_lines)

        # Separate statement from options
        # Options typically start with "A." / "A)" / "A -"
        option_split = re.search(r'\n\s*[A-Ea-e]\s*[\.\)\-]\s+', body)
        if option_split:
            statement_raw = body[:option_split.start()].strip()
            options_raw = body[option_split.start():]
        else:
            statement_raw = body.strip()
            options_raw = ""

        statement = clean_text(statement_raw)
        options = parse_options(options_raw)

        # Detect if question references an image/figure
        has_figure = bool(
            re.search(r'(?i)(figura|imagem|quadro|tabela|radiografia|tomografia|ECG|eletrocardiograma)', statement)
        )

        questions.append({
            "numero": q_num,
            "enunciado": statement,
            "alternativas": options,
            "tem_imagem": has_figure,
            "raw_block": block[:500],  # truncated for debugging
        })

    return questions

def classify_medical_area(text: str) -> list[str]:
    """Heuristic classification of medical specialty areas."""
    area_keywords = {
        "Clínica Médica": ["hipertensão", "diabetes", "infarto", "pneumonia", "insuficiência cardíaca",
                            "doença crônica", "anemia", "tireoide", "fibrilação"],
        "Cirurgia": ["cirurgia", "operação", "abdome agudo", "appendicite", "hernia", "trauma", "laparoscopia"],
        "Pediatria": ["criança", "lactente", "neonatal", "recém-nascido", "pediátrico", "vacinação infantil"],
        "Ginecologia e Obstetrícia": ["gestação", "parto", "gravidez", "prenatal", "puerpério",
                                       "eclâmpsia", "amenorreia", "endometriose"],
        "Medicina de Família e Comunidade": ["atenção básica", "saúde da família", "UBS", "ESF",
                                              "comunidade", "prevenção", "promoção da saúde"],
        "Saúde Coletiva": ["epidemiologia", "vigilância", "SUS", "políticas de saúde", "notificação compulsória"],
        "Urgência e Emergência": ["parada cardíaca", "RCP", "ressuscitação", "emergência", "choque", "trauma"],
        "Psiquiatria": ["depressão", "ansiedade", "esquizofrenia", "psicose", "transtorno", "psiquiátrico"],
    }
    text_lower = text.lower()
    matched = []
    for area, keywords in area_keywords.items():
        if any(kw in text_lower for kw in keywords):
            matched.append(area)
    return matched if matched else ["Não classificado"]

# ─── 1. Extract exam questions ────────────────────────────────────────────────

def process_exam_files():
    print("\n" + "="*60)
    print("1. EXTRAINDO QUESTÕES DAS PROVAS")
    print("="*60)

    all_results = {}

    for filename, (year, edition, caderno) in EXAM_FILE_MAP.items():
        pdf_path = BASE_DIR / filename
        if not pdf_path.exists():
            print(f"  [SKIP] {filename} - arquivo não encontrado")
            continue

        print(f"\n  Processando: {filename} → {year}_edicao{edition}_caderno{caderno}")
        full_text = extract_text_from_pdf(pdf_path)

        if not full_text.strip():
            print(f"  [WARN] Texto vazio extraído de {filename}")
            continue

        questions = split_into_questions(full_text)

        # Enrich each question
        for q in questions:
            q["areas_medicas"] = classify_medical_area(q["enunciado"])
            q.pop("raw_block", None)  # remove debug field

        exam_key = f"{year}_edicao{edition}_caderno{caderno}"
        output = {
            "prova_id": exam_key,
            "ano": year,
            "edicao": edition,
            "caderno": caderno,
            "arquivo_origem": filename,
            "total_questoes": len(questions),
            "extraido_em": datetime.now().isoformat(),
            "questoes": questions,
        }

        out_path = QUESTIONS_DIR / f"{exam_key}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"  ✓ {len(questions)} questões → {out_path.name}")
        all_results[exam_key] = {"total": len(questions), "arquivo": filename}

    return all_results

# ─── 2. Extract curriculum matrix ─────────────────────────────────────────────

def process_curriculum_matrix():
    print("\n" + "="*60)
    print("2. EXTRAINDO MATRIZ CURRICULAR")
    print("="*60)

    matrix_path = BASE_DIR / "Matriz de Referência Revalida INEP.pdf"
    if not matrix_path.exists():
        print("  [ERROR] Matriz de Referência não encontrada")
        return

    pages = extract_text_by_page(matrix_path)
    full_text = "\n".join(p["text"] for p in pages)

    # Parse the matrix structure
    # The matrix typically has: Grande Área > Área > Subárea > Conteúdo
    matrix = {
        "titulo": "Matriz de Referência Revalida INEP",
        "fonte": "Matriz de Referência Revalida INEP.pdf",
        "extraido_em": datetime.now().isoformat(),
        "grandes_areas": []
    }

    # Heuristic: detect section headers and build hierarchy
    lines = full_text.split('\n')
    current_grande_area = None
    current_area = None
    current_subarea = None

    # Patterns for section detection
    grande_area_re = re.compile(r'^(?:\d+\s+)?([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]{5,}[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ])$')
    area_re = re.compile(r'^\s{0,4}(\d+[\.\d]*)\s+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕa-záéíóúâêîôûãõ][\w\s\-/,]+)$')
    subarea_re = re.compile(r'^\s{4,8}[\-\•\*]\s+(.+)$')
    conteudo_re = re.compile(r'^\s{8,}[\-\•\*]\s+(.+)$')

    grandes_areas_keywords = [
        "CLÍNICA MÉDICA", "CIRURGIA", "PEDIATRIA", "GINECOLOGIA", "OBSTETRÍCIA",
        "MEDICINA DE FAMÍLIA", "SAÚDE COLETIVA", "URGÊNCIA", "EMERGÊNCIA",
        "ATENÇÃO BÁSICA", "PSIQUIATRIA"
    ]

    # Simplified hierarchical parsing
    sections = []
    current_section = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Detect top-level section (all caps, significant length)
        if stripped.isupper() and len(stripped) > 8:
            if current_section:
                sections.append(current_section)
            current_section = {
                "nome": stripped,
                "itens": []
            }
        elif current_section is not None:
            # Add as content item
            if stripped.startswith(('-', '•', '*', '–')):
                current_section["itens"].append(stripped.lstrip('-•*– ').strip())
            elif re.match(r'^\d+[\.\d]*\s+', stripped):
                current_section["itens"].append(stripped)
            elif len(stripped) > 10:
                current_section["itens"].append(stripped)

    if current_section:
        sections.append(current_section)

    matrix["secoes"] = sections
    matrix["texto_completo"] = full_text
    matrix["total_paginas"] = len(pages)

    out_path = OUTPUT_DIR / "matriz_curricular.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(matrix, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Matriz extraída → {out_path}")
    print(f"    {len(pages)} páginas | {len(sections)} seções detectadas")

# ─── 3. Style analysis ────────────────────────────────────────────────────────

def generate_style_analysis():
    print("\n" + "="*60)
    print("3. GERANDO ANÁLISE DE ESTILO")
    print("="*60)

    analysis = {
        "titulo": "Análise de Estilo das Questões Revalida INEP",
        "descricao": "Guia detalhado para reprodução do estilo avaliativo do INEP Revalida",
        "extraido_em": datetime.now().isoformat(),

        "perfil_geral": {
            "formato": "Questão de múltipla escolha com 5 alternativas (A-E)",
            "resposta_correta": "Sempre uma única resposta correta",
            "extensao_tipica": {
                "enunciado": "3-8 linhas de texto narrativo + dados clínicos",
                "alternativas": "1-2 linhas cada, 5 no total"
            },
            "lingua": "Português brasileiro formal e técnico",
            "nivel": "Graduação médica completa + prática clínica"
        },

        "estrutura_questao": {
            "componentes": [
                "Vinheta clínica (apresentação do caso)",
                "Dados do paciente (sexo, idade, sintomas, sinais vitais, exames)",
                "Pergunta direta ao final",
                "Cinco alternativas de resposta (A a E)"
            ],
            "tipos_de_pergunta": [
                "Qual é o diagnóstico mais provável?",
                "Qual é a conduta mais adequada?",
                "Qual é o exame complementar indicado?",
                "Qual é o tratamento de escolha?",
                "Qual é o fator de risco mais importante?",
                "Qual das afirmativas abaixo está CORRETA?",
                "Qual das alternativas descreve corretamente...?",
                "O médico deve, INICIALMENTE, realizar:",
                "A conduta MAIS ADEQUADA é:"
            ]
        },

        "padroes_linguisticos": {
            "vinheta_clinica": {
                "descricao": "Narrativa de caso em terceira pessoa, tempo presente",
                "formulas_de_abertura": [
                    "Paciente de [X] anos, [sexo], procura atendimento médico com queixa de...",
                    "Homem de [X] anos é atendido no pronto-socorro com...",
                    "Mulher de [X] anos, [estado civil], gestante de [X] semanas, apresenta...",
                    "Criança de [X] anos é trazida pelos pais com história de...",
                    "Idoso de [X] anos, com antecedente de [doença], refere...",
                    "Médico da Atenção Básica atende paciente que..."
                ],
                "dados_tipicamente_incluidos": [
                    "Idade e sexo do paciente",
                    "Queixas principais (duração e intensidade)",
                    "Histórico de doenças prévias",
                    "Medicamentos em uso",
                    "Exame físico (sinais vitais, achados relevantes)",
                    "Exames laboratoriais com valores",
                    "Exames de imagem (descrição ou referência à figura)"
                ]
            },
            "estilo_redacao": {
                "tempo_verbal": "Presente do indicativo predominante",
                "pessoa": "Terceira pessoa do singular",
                "tom": "Objetivo, impessoal, técnico-científico",
                "vocabulario": "Terminologia médica padronizada, sem jargões regionais",
                "abreviaturas_comuns": [
                    "FC (frequência cardíaca)", "PA (pressão arterial)", "FR (frequência respiratória)",
                    "SpO2 (saturação de oxigênio)", "TAD/TAS (tensão arterial diastólica/sistólica)",
                    "IMC (índice de massa corporal)", "HAS (hipertensão arterial sistêmica)",
                    "DM (diabetes mellitus)", "HIV", "SUS", "ESF", "UBS", "IVAS", "ITU"
                ]
            }
        },

        "tendencias_avaliativas": {
            "eixos_prioritarios": [
                "Raciocínio clínico diagnóstico (eliminação por critérios)",
                "Tomada de decisão terapêutica baseada em evidências",
                "Urgências e emergências (condutas imediatas)",
                "Atenção Básica e medicina preventiva",
                "Casos clínicos complexos com comorbidades",
                "Situações de saúde pública e epidemiologia"
            ],
            "distribuicao_por_area": {
                "Clínica Médica": "~25-30% das questões",
                "Cirurgia Geral": "~15-20%",
                "Ginecologia e Obstetrícia": "~10-15%",
                "Pediatria": "~10-15%",
                "Medicina de Família e Comunidade/Saúde Coletiva": "~15-20%",
                "Urgência e Emergência": "~10-15%"
            },
            "evolucao_temporal": {
                "2011_2015": "Questões mais factualistas, diagnóstico direto",
                "2016_2020": "Maior ênfase em conduta e raciocínio clínico integrado",
                "2021_presente": "Foco em casos complexos, atenção básica, saúde coletiva e interprofissionalidade"
            },
            "caracteristicas_distratores": [
                "Alternativas plausíveis mas erradas por detalhes técnicos",
                "Confusão entre tratamento de 1ª e 2ª linha",
                "Inversão de condutas (ex: medicar antes de examinar)",
                "Conduta correta mas para diagnóstico diferente",
                "Exame correto mas em momento inadequado"
            ]
        },

        "boas_praticas_para_ia": {
            "instrucoes_geracao": [
                "Sempre iniciar com vinheta clínica realista e coerente",
                "Incluir dados objetivos: idade, sexo, sinais vitais, exames com valores numéricos",
                "A pergunta deve focar em UMA decisão clínica específica",
                "Formular exatamente 5 alternativas, sendo apenas 1 correta",
                "Os distratores devem ser clinicamente plausíveis mas tecnicamente incorretos",
                "Usar terminologia médica brasileira padronizada (CFM, ANVISA, Ministério da Saúde)",
                "Basear condutas em protocolos do SUS e diretrizes brasileiras",
                "Evitar questões puramente memorísticas; priorizar raciocínio clínico",
                "Incluir implicações de saúde pública quando relevante"
            ],
            "armadilhas_a_evitar": [
                "Não usar linguagem coloquial ou regional",
                "Não criar alternativas obviamente absurdas",
                "Não repetir informação da vinheta nas alternativas",
                "Não usar dupla negação",
                "Não criar pistas gramaticais que favoreçam a resposta correta",
                "Não usar 'todas as anteriores' ou 'nenhuma das anteriores'",
                "Evitar questões com apenas um dado clínico (pouco realistas)"
            ],
            "checklist_qualidade": [
                "A vinheta é suficiente para resolver sem ambiguidade?",
                "O distrator mais atraente é tecnicamente incorreto por razão clara?",
                "A questão avalia raciocínio clínico, não memorização?",
                "A conduta correta está alinhada com protocolos brasileiros vigentes?",
                "Os dados clínicos são internamente coerentes?",
                "A questão pode ser respondida sem consultar material externo?"
            ]
        },

        "exemplos_estrutura_tipica": [
            {
                "tipo": "Diagnóstico diferencial",
                "template": (
                    "Paciente de [X] anos, [sexo], procura Unidade Básica de Saúde referindo "
                    "[sintoma A] há [tempo], associado a [sintoma B] e [sintoma C]. "
                    "Nega [antecedentes relevantes]. Ao exame físico: [achados]. "
                    "Exames laboratoriais revelam [dados]. "
                    "Qual é o diagnóstico mais provável?"
                )
            },
            {
                "tipo": "Conduta imediata",
                "template": (
                    "Homem de [X] anos é admitido no pronto-socorro com [queixa aguda]. "
                    "PA: [valor] mmHg, FC: [valor] bpm, FR: [valor] irpm, SpO2: [valor]%. "
                    "Exame físico demonstra [achados críticos]. "
                    "Qual deve ser a conduta IMEDIATA do médico?"
                )
            },
            {
                "tipo": "Atenção Básica",
                "template": (
                    "Médico de família acompanha paciente de [X] anos com [doença crônica]. "
                    "Na consulta de rotina, [novo dado clínico]. "
                    "O médico identifica [situação]. "
                    "Qual é a conduta mais adequada nesse contexto?"
                )
            }
        ]
    }

    out_path = OUTPUT_DIR / "analise_estilo_revalida.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Análise de estilo → {out_path}")

# ─── 4. Extract answer keys (gabaritos) ───────────────────────────────────────

ANSWER_LETTER_RE = re.compile(
    r'(\d{1,3})\s*[\.:\-\s]\s*([A-Ea-e])\b'
)

GABARITO_TABLE_RE = re.compile(
    r'(?:QUEST[ÃA]O|Q\.?)?\s*(\d{1,3})\s+([A-Ea-e])',
    re.IGNORECASE
)

def parse_gabarito_text(text: str) -> dict:
    """Parse answer key text and return {question_number: answer_letter}."""
    answers = {}

    # Try both patterns
    for pattern in [ANSWER_LETTER_RE, GABARITO_TABLE_RE]:
        for match in pattern.finditer(text):
            q_num = int(match.group(1))
            letter = match.group(2).upper()
            if 1 <= q_num <= 200 and letter in "ABCDE":
                answers[q_num] = letter

    return answers

def process_gabaritos():
    print("\n" + "="*60)
    print("4. EXTRAINDO GABARITOS")
    print("="*60)

    all_gabaritos = {}

    for filename, (year, edition, caderno) in GABARITO_FILE_MAP.items():
        pdf_path = GABARITOS_DIR / filename
        if not pdf_path.exists():
            print(f"  [SKIP] {filename} - não encontrado")
            continue

        print(f"\n  Processando: {filename} → {year}_edicao{edition}_caderno{caderno}")
        full_text = extract_text_from_pdf(pdf_path)

        if not full_text.strip():
            print(f"  [WARN] Texto vazio de {filename}")
            continue

        answers = parse_gabarito_text(full_text)
        exam_key = f"{year}_edicao{edition}_caderno{caderno}"

        gabarito_entry = {
            "prova_id": exam_key,
            "ano": year,
            "edicao": edition,
            "caderno": caderno,
            "arquivo_origem": filename,
            "total_questoes": len(answers),
            "extraido_em": datetime.now().isoformat(),
            "gabarito": {str(k): v for k, v in sorted(answers.items())},
        }

        # Merge if same exam_key already exists (multiple cadernos)
        if exam_key in all_gabaritos:
            all_gabaritos[exam_key]["gabarito"].update(gabarito_entry["gabarito"])
            all_gabaritos[exam_key]["total_questoes"] = len(all_gabaritos[exam_key]["gabarito"])
        else:
            all_gabaritos[exam_key] = gabarito_entry

        print(f"  ✓ {len(answers)} respostas encontradas")

    # Save combined gabaritos file
    combined = {
        "descricao": "Gabaritos Revalida por prova",
        "total_provas": len(all_gabaritos),
        "extraido_em": datetime.now().isoformat(),
        "gabaritos": all_gabaritos,
    }

    out_path = OUTPUT_DIR / "gabaritos.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print(f"\n  ✓ Gabaritos consolidados → {out_path}")
    print(f"    {len(all_gabaritos)} provas processadas")

    # Also save individual gabarito files for easy lookup
    gabaritos_dir = OUTPUT_DIR / "gabaritos"
    gabaritos_dir.mkdir(exist_ok=True)
    for exam_key, data in all_gabaritos.items():
        ind_path = gabaritos_dir / f"{exam_key}.json"
        with open(ind_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    return all_gabaritos

# ─── 5. Generate summary report ───────────────────────────────────────────────

def generate_summary(questions_result, gabaritos_result):
    print("\n" + "="*60)
    print("5. RELATÓRIO FINAL")
    print("="*60)

    summary = {
        "pipeline": "Revalida PDF Extraction",
        "executado_em": datetime.now().isoformat(),
        "provas_processadas": questions_result,
        "gabaritos_processados": {
            k: v["total_questoes"] for k, v in gabaritos_result.items()
        },
        "arquivos_gerados": {
            "questoes": str(QUESTIONS_DIR),
            "gabaritos": str(OUTPUT_DIR / "gabaritos.json"),
            "gabaritos_individuais": str(OUTPUT_DIR / "gabaritos"),
            "matriz_curricular": str(OUTPUT_DIR / "matriz_curricular.json"),
            "analise_estilo": str(OUTPUT_DIR / "analise_estilo_revalida.json"),
        }
    }

    out_path = OUTPUT_DIR / "pipeline_summary.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\n  ✓ Relatório → {out_path}")
    print(f"\n  Questões: {sum(v.get('total', 0) for v in questions_result.values())} total")
    print(f"  Gabaritos: {len(gabaritos_result)} provas")
    print(f"\n  Output: {OUTPUT_DIR}")

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("REVALIDA PIPELINE - Extração de PDFs")
    print(f"Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    questions_result = process_exam_files()
    process_curriculum_matrix()
    generate_style_analysis()
    gabaritos_result = process_gabaritos()
    generate_summary(questions_result, gabaritos_result)

    print("\n✓ Pipeline concluído com sucesso!")
