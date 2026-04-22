-- =============================================================================
-- ROLES E PERMISSÕES — Page Revalida
-- =============================================================================
-- SECURITY: Princípio do menor privilégio. Jamais use o usuário owner/root
--           do banco na aplicação. Cada role tem exatamente o que precisa.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Revogar permissões padrão do PUBLIC (fechamento do schema público)
-- -----------------------------------------------------------------------------
-- SECURITY: Por padrão, qualquer usuário pode criar objetos em public.
--           Isso fecha essa brecha.
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- 2. Role de leitura/escrita da aplicação (conexão do servidor Node.js)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      CONNECTION LIMIT 50;
    COMMENT ON ROLE app_user IS 'Role da aplicação — acesso CRUD limitado por RLS';
  END IF;
END
$$;

-- SECURITY: A senha deve ser definida via variável de ambiente, nunca aqui.
-- Execute fora deste arquivo: ALTER ROLE app_user PASSWORD :'APP_USER_PASSWORD';

-- -----------------------------------------------------------------------------
-- 3. Role administrativa (migrações, manutenção, backoffice interno)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
    CREATE ROLE app_admin WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      CONNECTION LIMIT 10;
    COMMENT ON ROLE app_admin IS 'Role administrativa — migrações, relatórios, suporte';
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 4. Role somente-leitura (analytics, BI, relatórios externos)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
    CREATE ROLE app_readonly WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      CONNECTION LIMIT 5;
    COMMENT ON ROLE app_readonly IS 'Role somente-leitura — analytics e relatórios';
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 5. Permissões de schema
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO app_admin;
GRANT USAGE ON SCHEMA public TO app_readonly;

-- -----------------------------------------------------------------------------
-- 6. Permissões de tabela — app_user (CRUD via RLS)
-- -----------------------------------------------------------------------------
-- SELECT em tabelas permitidas
GRANT SELECT ON TABLE
  users,
  sessions,
  specialties,
  topics,
  questions,
  question_options,
  user_answers,
  study_sessions,
  materials,
  generated_questions,
  subscriptions,
  streaks
TO app_user;

-- INSERT apenas nas tabelas que o usuário manipula
GRANT INSERT ON TABLE
  sessions,
  user_answers,
  study_sessions,
  materials,
  generated_questions,
  streaks
TO app_user;

-- UPDATE limitado (RLS restringe ao próprio usuário)
GRANT UPDATE ON TABLE
  users,
  sessions,
  user_answers,
  study_sessions,
  materials,
  generated_questions,
  streaks,
  subscriptions
TO app_user;

-- DELETE nunca concedido — soft delete via updated_at/deleted_at
-- SECURITY: Sem DELETE real para app_user; auditoria preservada.

-- Acesso a sequences dos UUIDs (gen_random_uuid não precisa, mas por completude)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- -----------------------------------------------------------------------------
-- 7. Permissões de tabela — app_admin (acesso completo exceto TRUNCATE/DROP)
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Permissão para INSERT em audit_logs (trigger roda como owner, mas admin pode inserir diretamente)
GRANT INSERT ON TABLE audit_logs TO app_admin;

-- -----------------------------------------------------------------------------
-- 8. Permissões de tabela — app_readonly
-- -----------------------------------------------------------------------------
GRANT SELECT ON TABLE
  specialties,
  topics,
  questions,
  question_options
TO app_readonly;

-- SECURITY: app_readonly não vê dados de usuários (PII protegido)

-- -----------------------------------------------------------------------------
-- 9. Permissões default para objetos futuros
-- -----------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO app_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO app_admin;
