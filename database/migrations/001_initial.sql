-- =============================================================================
-- MIGRATION 001 — Initial Schema — Page Revalida
-- Criada em: 2026-04-20
-- =============================================================================
-- Como executar:
--   psql $POSTGRES_URL_NON_POOLING \
--     -v APP_USER_PASSWORD="$APP_USER_PASSWORD" \
--     -v APP_ADMIN_PASSWORD="$APP_ADMIN_PASSWORD" \
--     -f database/migrations/001_initial.sql
-- =============================================================================

BEGIN;

-- Registra a migration antes de executar (idempotência)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT        PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT
);

-- Aborta se já aplicada
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001') THEN
    RAISE EXCEPTION 'Migration 001 já aplicada. Abortando.';
  END IF;
END;
$$;

-- =============================================================================
-- 1. Extensões
-- =============================================================================
\i database/schema.sql

-- =============================================================================
-- 2. Roles e permissões
-- =============================================================================
\i database/roles.sql

-- Senhas das roles via variáveis de ambiente (nunca hardcoded)
-- Execute manualmente ou via script de deploy:
--   ALTER ROLE app_user  PASSWORD :'APP_USER_PASSWORD';
--   ALTER ROLE app_admin PASSWORD :'APP_ADMIN_PASSWORD';

-- =============================================================================
-- 3. RLS Policies
-- =============================================================================
\i database/rls_policies.sql

-- =============================================================================
-- 4. Triggers de auditoria e negócio
-- =============================================================================
\i database/triggers.sql

-- =============================================================================
-- 5. Índices de performance
-- =============================================================================
\i database/indexes.sql

-- =============================================================================
-- 6. Dados iniciais (seed)
-- =============================================================================

-- Especialidades do REVALIDA (baseado no edital INEP)
INSERT INTO specialties (name, slug, description) VALUES
  ('Clínica Médica',          'clinical-medicine', 'Medicina interna, doenças sistêmicas e crônicas'),
  ('Cirurgia Geral',          'surgery',           'Cirurgia abdominal, trauma, urgência cirúrgica'),
  ('Pediatria',               'pediatrics',        'Saúde da criança e do adolescente'),
  ('Ginecologia e Obstetrícia','obstetrics',       'Saúde da mulher, pré-natal, parto'),
  ('Medicina Preventiva',     'public-health',     'Saúde pública, epidemiologia, vigilância sanitária')
ON CONFLICT (slug) DO NOTHING;

-- Tópicos de Clínica Médica
INSERT INTO topics (specialty_id, name, slug)
SELECT s.id, t.name, t.slug FROM specialties s
CROSS JOIN (VALUES
  ('Cardiologia',           'cardiology'),
  ('Pneumologia',           'pulmonology'),
  ('Gastroenterologia',     'gastroenterology'),
  ('Endocrinologia',        'endocrinology'),
  ('Nefrologia',            'nephrology'),
  ('Reumatologia',          'rheumatology'),
  ('Neurologia',            'neurology'),
  ('Infectologia',          'infectious-disease'),
  ('Hematologia',           'hematology'),
  ('Oncologia Básica',      'basic-oncology')
) AS t(name, slug)
WHERE s.slug = 'clinical-medicine'
ON CONFLICT (specialty_id, slug) DO NOTHING;

-- Tópicos de Cirurgia Geral
INSERT INTO topics (specialty_id, name, slug)
SELECT s.id, t.name, t.slug FROM specialties s
CROSS JOIN (VALUES
  ('Abdome Agudo',          'acute-abdomen'),
  ('Trauma',                'trauma'),
  ('Cirurgia de Urgência',  'emergency-surgery'),
  ('Hérnias',               'hernias'),
  ('Oncologia Cirúrgica',   'surgical-oncology')
) AS t(name, slug)
WHERE s.slug = 'surgery'
ON CONFLICT (specialty_id, slug) DO NOTHING;

-- Tópicos de Pediatria
INSERT INTO topics (specialty_id, name, slug)
SELECT s.id, t.name, t.slug FROM specialties s
CROSS JOIN (VALUES
  ('Neonatologia',          'neonatology'),
  ('Imunizações',           'immunizations'),
  ('Crescimento e Desenvolvimento', 'growth-development'),
  ('Doenças Infecciosas Pediátricas', 'pediatric-infectious'),
  ('Urgência Pediátrica',   'pediatric-emergency')
) AS t(name, slug)
WHERE s.slug = 'pediatrics'
ON CONFLICT (specialty_id, slug) DO NOTHING;

-- =============================================================================
-- 7. Registra a migration como aplicada
-- =============================================================================
INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Schema inicial — Page Revalida: users, sessions, specialties, topics, questions, user_answers, study_sessions, materials, generated_questions, subscriptions, streaks, audit_logs');

COMMIT;

\echo 'Migration 001 aplicada com sucesso.'
