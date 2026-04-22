-- ============================================================
-- Schema PostgreSQL para Pipeline de Provas
-- Compatível com Supabase
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CONCURSOS
-- ============================================================
CREATE TABLE IF NOT EXISTS concursos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        TEXT NOT NULL,
    banca       TEXT,
    ano         INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (nome, banca, ano)
);

-- ============================================================
-- ARQUIVOS PDF
-- ============================================================
CREATE TABLE IF NOT EXISTS arquivos_pdf (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_origem      TEXT NOT NULL,
    nome_arquivo    TEXT NOT NULL,
    caminho_local   TEXT NOT NULL,
    hash_sha256     TEXT NOT NULL UNIQUE,
    tamanho_bytes   BIGINT,
    data_download   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status_download TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status_download IN ('pendente', 'baixado', 'erro', 'duplicado'))
);

CREATE INDEX IF NOT EXISTS idx_arquivos_pdf_hash ON arquivos_pdf(hash_sha256);
CREATE INDEX IF NOT EXISTS idx_arquivos_pdf_status ON arquivos_pdf(status_download);

-- ============================================================
-- PROVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS provas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concurso_id         UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
    titulo              TEXT,
    cargo               TEXT,
    turno               TEXT,
    tipo_caderno        TEXT,
    lingua              TEXT DEFAULT 'pt-BR',
    arquivo_pdf_id      UUID REFERENCES arquivos_pdf(id) ON DELETE SET NULL,
    total_paginas       INTEGER,
    hash_pdf            TEXT,
    status_processamento TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status_processamento IN ('pendente', 'processando', 'concluido', 'erro')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provas_concurso ON provas(concurso_id);
CREATE INDEX IF NOT EXISTS idx_provas_status ON provas(status_processamento);

-- ============================================================
-- PÁGINAS DA PROVA
-- ============================================================
CREATE TABLE IF NOT EXISTS paginas_prova (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prova_id        UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
    numero_pagina   INTEGER NOT NULL,
    texto_bruto     TEXT,
    possui_ocr      BOOLEAN NOT NULL DEFAULT FALSE,
    largura         FLOAT,
    altura          FLOAT,
    UNIQUE (prova_id, numero_pagina)
);

CREATE INDEX IF NOT EXISTS idx_paginas_prova ON paginas_prova(prova_id);

-- ============================================================
-- QUESTÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS questoes (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prova_id                    UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
    numero_questao              INTEGER NOT NULL,
    tipo_questao                TEXT NOT NULL DEFAULT 'objetiva'
        CHECK (tipo_questao = 'objetiva'),
    pagina_inicio               INTEGER,
    pagina_fim                  INTEGER,
    enunciado                   TEXT,
    texto_completo              TEXT,
    possui_imagem               BOOLEAN NOT NULL DEFAULT FALSE,
    bbox_principal_json         JSONB,
    score_confianca_extracao    FLOAT NOT NULL DEFAULT 0.0,
    precisa_revisao_manual      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (prova_id, numero_questao)
);

CREATE INDEX IF NOT EXISTS idx_questoes_prova ON questoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_questoes_revisao ON questoes(precisa_revisao_manual);
CREATE INDEX IF NOT EXISTS idx_questoes_score ON questoes(score_confianca_extracao);

-- ============================================================
-- ALTERNATIVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS alternativas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questao_id  UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    letra       CHAR(1) NOT NULL,
    texto       TEXT NOT NULL,
    ordem       INTEGER NOT NULL,
    UNIQUE (questao_id, letra)
);

CREATE INDEX IF NOT EXISTS idx_alternativas_questao ON alternativas(questao_id);

-- ============================================================
-- IMAGENS DE QUESTÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS imagens_questao (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questao_id                  UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    prova_id                    UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
    numero_pagina               INTEGER NOT NULL,
    caminho_arquivo             TEXT NOT NULL,
    nome_arquivo                TEXT NOT NULL,
    mime_type                   TEXT NOT NULL DEFAULT 'image/png',
    largura                     INTEGER,
    altura                      INTEGER,
    bbox_json                   JSONB,
    tipo_estimado               TEXT
        CHECK (tipo_estimado IN ('foto', 'grafico', 'tabela', 'diagrama', 'formula', 'mapa', 'outro', NULL)),
    hash_sha256                 TEXT NOT NULL,
    score_confianca_associacao  FLOAT NOT NULL DEFAULT 0.0,
    precisa_revisao_manual      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imagens_questao ON imagens_questao(questao_id);
CREATE INDEX IF NOT EXISTS idx_imagens_prova ON imagens_questao(prova_id);
CREATE INDEX IF NOT EXISTS idx_imagens_hash ON imagens_questao(hash_sha256);

-- ============================================================
-- REVISÃO MANUAL
-- ============================================================
CREATE TABLE IF NOT EXISTS revisao_manual (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prova_id        UUID REFERENCES provas(id) ON DELETE CASCADE,
    questao_id      UUID REFERENCES questoes(id) ON DELETE CASCADE,
    imagem_id       UUID REFERENCES imagens_questao(id) ON DELETE CASCADE,
    tipo_problema   TEXT NOT NULL,
    descricao       TEXT,
    status          TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'revisado', 'ignorado')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisao_prova ON revisao_manual(prova_id);
CREATE INDEX IF NOT EXISTS idx_revisao_status ON revisao_manual(status);

-- ============================================================
-- LOGS DE PROCESSAMENTO
-- ============================================================
CREATE TABLE IF NOT EXISTS logs_processamento (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prova_id        UUID REFERENCES provas(id) ON DELETE CASCADE,
    nivel           TEXT NOT NULL CHECK (nivel IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    etapa           TEXT NOT NULL,
    mensagem        TEXT NOT NULL,
    detalhes_json   JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_prova ON logs_processamento(prova_id);
CREATE INDEX IF NOT EXISTS idx_logs_nivel ON logs_processamento(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_etapa ON logs_processamento(etapa);
