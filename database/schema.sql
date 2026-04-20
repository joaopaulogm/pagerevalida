-- =============================================================================
-- SCHEMA PRINCIPAL — Page Revalida
-- Plataforma de preparação para o Exame REVALIDA (INEP)
-- =============================================================================
-- Convenções:
--   • PKs: UUID via gen_random_uuid() — nunca SERIAL exposto
--   • Timestamps: created_at / updated_at DEFAULT NOW()
--   • Soft delete: deleted_at TIMESTAMPTZ NULL (NULL = ativo)
--   • RLS habilitado em todas as tabelas com dados de usuário
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensões
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUIDs v4 adicionais
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- crypt(), gen_salt(), pgp_sym_encrypt()
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- monitoramento de queries

-- -----------------------------------------------------------------------------
-- Tipo enumerado: conviction matrix (Raio-X)
-- CC = Correto + Confiante | CD = Correto + Duvidoso
-- EC = Errado  + Confiante | ED = Errado  + Duvidoso
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE conviction_type AS ENUM ('CC', 'CD', 'EC', 'ED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free', 'premium', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_source AS ENUM ('inep', 'ai_generated', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_difficulty AS ENUM ('basic', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_style AS ENUM ('long_case', 'direct');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE material_type AS ENUM ('guideline', 'summary', 'chapter', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audit_operation AS ENUM ('INSERT', 'UPDATE', 'DELETE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- TABELA: users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- SECURITY: email único, lowercase normalizado na inserção
  email             TEXT        NOT NULL,
  -- SECURITY: hash bcrypt via pgcrypto — nunca senha em texto puro
  password_hash     TEXT        NOT NULL,

  full_name         TEXT        NOT NULL,
  avatar_url        TEXT,
  plan_type         plan_type   NOT NULL DEFAULT 'free',
  is_verified       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,

  -- SECURITY: CPF armazenado criptografado com pgp_sym_encrypt
  -- Descriptografar apenas na camada de serviço com a chave do ambiente
  cpf_encrypted     BYTEA,

  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ           -- NULL = ativo (soft delete)
);

-- SECURITY: email como texto puro (indexado), normalizado para lowercase
ALTER TABLE users ADD CONSTRAINT users_email_lowercase
  CHECK (email = lower(email));

ALTER TABLE users ADD CONSTRAINT users_email_unique
  UNIQUE (email) DEFERRABLE INITIALLY IMMEDIATE;

COMMENT ON TABLE  users                IS 'Médicos e residentes cadastrados na plataforma';
COMMENT ON COLUMN users.password_hash  IS 'SECURITY: bcrypt via crypt(senha, gen_salt(''bf'',12))';
COMMENT ON COLUMN users.cpf_encrypted  IS 'SECURITY: pgp_sym_encrypt(cpf, APP_SECRET_KEY)';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- SECURITY: jamais armazene o token em texto puro
  -- Armazene encode(sha256(token::bytea),'hex'); valide com a mesma função
  token_hash      TEXT        NOT NULL UNIQUE,

  ip_address      INET,
  user_agent      TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,              -- NULL = sessão válida

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

COMMENT ON COLUMN sessions.token_hash IS 'SECURITY: encode(sha256(token::bytea),''hex'') — token original nunca armazenado';

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: specialties (Especialidades médicas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS specialties (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,  -- 'cardiology', 'pediatrics', etc.
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

COMMENT ON TABLE specialties IS 'Especialidades do REVALIDA: Clínica, Cirurgia, Pediatria, GO, Saúde Pública';

-- Sem RLS — dados públicos da plataforma

-- =============================================================================
-- TABELA: topics (Tópicos dentro de cada especialidade)
-- =============================================================================
CREATE TABLE IF NOT EXISTS topics (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id  UUID    NOT NULL REFERENCES specialties(id),
  name          TEXT    NOT NULL,
  slug          TEXT    NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,

  UNIQUE (specialty_id, slug)
);

-- Sem RLS — dados públicos da plataforma

-- =============================================================================
-- TABELA: questions (Questões estilo INEP / Clínicas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id            UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id  UUID                NOT NULL REFERENCES specialties(id),
  topic_id      UUID                REFERENCES topics(id),

  content       TEXT                NOT NULL,  -- enunciado clínico completo
  source        question_source     NOT NULL DEFAULT 'manual',
  difficulty    question_difficulty NOT NULL DEFAULT 'intermediate',
  style         question_style      NOT NULL DEFAULT 'long_case',

  -- Metadados INEP: ano, prova, questão original
  inep_year     SMALLINT,
  inep_exam_ref TEXT,

  is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
  metadata      JSONB               NOT NULL DEFAULT '{}',

  created_by    UUID                REFERENCES users(id),
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

COMMENT ON COLUMN questions.metadata IS 'Tags, referências, comentários editoriais — use índice GIN (ver indexes.sql)';

-- Sem RLS — questões são públicas para usuários autenticados

-- =============================================================================
-- TABELA: question_options (Alternativas A/B/C/D)
-- =============================================================================
CREATE TABLE IF NOT EXISTS question_options (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID    NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  letter      CHAR(1) NOT NULL CHECK (letter IN ('A','B','C','D','E')),
  content     TEXT    NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (question_id, letter)
);

-- Constraint: apenas uma alternativa correta por questão
CREATE UNIQUE INDEX IF NOT EXISTS question_options_one_correct
  ON question_options (question_id)
  WHERE is_correct = TRUE;

-- =============================================================================
-- TABELA: study_sessions (Sessões de estudo do usuário)
-- =============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id),

  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  questions_count   INTEGER     NOT NULL DEFAULT 0,
  correct_count     INTEGER     NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: user_answers (Respostas + Matriz de Convicção)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_answers (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID            NOT NULL REFERENCES users(id),
  question_id         UUID            NOT NULL REFERENCES questions(id),
  selected_option_id  UUID            NOT NULL REFERENCES question_options(id),
  study_session_id    UUID            REFERENCES study_sessions(id),

  conviction          conviction_type NOT NULL,  -- CC/CD/EC/ED
  is_correct          BOOLEAN         NOT NULL,
  time_spent_seconds  INTEGER         CHECK (time_spent_seconds > 0),
  answered_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- Índice único: evita resposta duplicada na mesma sessão
  UNIQUE (user_id, question_id, study_session_id)
);

COMMENT ON TABLE  user_answers            IS 'Matriz de convicção: CC/CD/EC/ED por resposta (core do Raio-X)';
COMMENT ON COLUMN user_answers.conviction IS 'CC=Correto+Confiante CD=Correto+Duvidoso EC=Errado+Confiante ED=Errado+Duvidoso';

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: streaks (Sequência de estudo diário)
-- =============================================================================
CREATE TABLE IF NOT EXISTS streaks (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES users(id) UNIQUE,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: subscriptions (Planos e assinaturas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                        UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID                  NOT NULL REFERENCES users(id),
  plan_type                 plan_type             NOT NULL,
  status                    subscription_status   NOT NULL DEFAULT 'trial',

  started_at                TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  expires_at                TIMESTAMPTZ,
  trial_ends_at             TIMESTAMPTZ,

  payment_provider          TEXT,                 -- 'stripe', 'asaas', etc.
  -- SECURITY: ID externo criptografado para evitar correlação de dados
  external_subscription_id  BYTEA,

  created_at                TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

COMMENT ON COLUMN subscriptions.external_subscription_id IS 'SECURITY: pgp_sym_encrypt(id_externo, APP_SECRET_KEY)';

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: materials (Acervo — guidelines, resumos, capítulos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS materials (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES users(id),
  specialty_id  UUID          REFERENCES specialties(id),

  title         TEXT          NOT NULL,
  content       TEXT          NOT NULL,  -- texto colado pelo usuário no Lab
  type          material_type NOT NULL DEFAULT 'other',
  word_count    INTEGER,
  metadata      JSONB         NOT NULL DEFAULT '{}',

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: generated_questions (Questões geradas pelo Lab/IA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS generated_questions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id),
  material_id   UUID        REFERENCES materials(id),
  question_id   UUID        REFERENCES questions(id),  -- preenchido ao salvar

  prompt_hash   TEXT,       -- hash do prompt para deduplicação
  difficulty    question_difficulty NOT NULL DEFAULT 'intermediate',
  style         question_style      NOT NULL DEFAULT 'long_case',
  is_saved      BOOLEAN     NOT NULL DEFAULT FALSE,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

ALTER TABLE generated_questions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- TABELA: audit_logs (Trilha de auditoria imutável)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT            NOT NULL,
  operation   audit_operation NOT NULL,
  record_id   UUID,

  old_data    JSONB,          -- snapshot anterior (UPDATE/DELETE)
  new_data    JSONB,          -- snapshot novo    (INSERT/UPDATE)

  -- SECURITY: user_id pode ser NULL para operações de sistema
  actor_user_id UUID,
  actor_ip      INET,
  actor_agent   TEXT,

  occurred_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- SECURITY: audit_logs é append-only — sem UPDATE/DELETE permitido
-- Garantido pelas policies RLS e pela ausência de GRANT UPDATE/DELETE nesta tabela
COMMENT ON TABLE audit_logs IS 'SECURITY: Append-only. Não conceder UPDATE/DELETE a nenhuma role de aplicação.';

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FUNÇÃO: updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Aplicar trigger updated_at em todas as tabelas com a coluna
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','sessions','study_sessions','user_answers',
    'streaks','subscriptions','materials','generated_questions',
    'specialties','topics','questions','question_options'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END;
$$;
