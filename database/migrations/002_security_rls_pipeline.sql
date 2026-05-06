-- =============================================================================
-- MIGRATION 002 — Segurança: RLS nas tabelas do pipeline + correção da view
-- Criada em: 2026-05-05
--
-- Problemas corrigidos (Supabase Security Advisor):
--   1. Security Definer View: public.vw_questoes_resumo
--   2. RLS Disabled in Public: concursos, provas, arquivos_pdf, paginas_prova,
--      questoes, alternativas, imagens_questao, revisao_manual, logs_processamento
--
-- Estratégia de acesso:
--   • Tabelas de conteúdo público (concursos, provas, questoes, alternativas,
--     imagens_questao): SELECT para authenticated; escrita apenas via service_role
--   • Tabelas internas do pipeline (arquivos_pdf, paginas_prova, revisao_manual,
--     logs_processamento): sem acesso via Data API (só service_role)
--   • service_role bypassa RLS por design — pipeline continua funcionando
-- =============================================================================

BEGIN;

-- Registra a migration (idempotência)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT        PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '002') THEN
    RAISE EXCEPTION 'Migration 002 já aplicada. Abortando.';
  END IF;
END;
$$;

-- =============================================================================
-- 1. CORREÇÃO DA VIEW COM SECURITY DEFINER
--    public.vw_questoes_resumo — troca SECURITY DEFINER por SECURITY INVOKER
--    para que a view respeite o RLS do usuário que a consulta (Postgres 15+)
-- =============================================================================

ALTER VIEW IF EXISTS public.vw_questoes_resumo SET (security_invoker = true);

-- =============================================================================
-- 2. HABILITAR RLS — tabelas do pipeline sem RLS
-- =============================================================================

ALTER TABLE public.concursos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos_pdf        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paginas_prova       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternativas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagens_questao     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisao_manual      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_processamento  ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. POLICIES — conteúdo público de provas (leitura para authenticated)
--    Escrita ocorre exclusivamente via service_role (pipeline), que bypassa RLS.
-- =============================================================================

-- concursos: metadados dos concursos INEP — leitura pública para autenticados
CREATE POLICY concursos_select_authenticated ON public.concursos
  FOR SELECT TO authenticated
  USING (true);

-- provas: metadados das provas — leitura pública para autenticados
CREATE POLICY provas_select_authenticated ON public.provas
  FOR SELECT TO authenticated
  USING (true);

-- questoes: enunciados extraídos — leitura pública para autenticados
CREATE POLICY questoes_select_authenticated ON public.questoes
  FOR SELECT TO authenticated
  USING (true);

-- alternativas: texto das alternativas — leitura pública para autenticados
CREATE POLICY alternativas_select_authenticated ON public.alternativas
  FOR SELECT TO authenticated
  USING (true);

-- imagens_questao: imagens associadas às questões — leitura pública para autenticados
CREATE POLICY imagens_questao_select_authenticated ON public.imagens_questao
  FOR SELECT TO authenticated
  USING (true);

-- =============================================================================
-- 4. POLICIES — tabelas internas do pipeline (sem acesso via Data API)
--    arquivos_pdf, paginas_prova, revisao_manual, logs_processamento
--    Nenhuma policy criada → apenas service_role (bypass RLS) pode acessar.
--    Isso bloqueia anon e authenticated via PostgREST/Data API.
-- =============================================================================

-- Sem policies em: arquivos_pdf, paginas_prova, revisao_manual, logs_processamento
-- O deny implícito do RLS protege essas tabelas sem necessidade de policy explícita.

-- =============================================================================
-- Registra a migration
-- =============================================================================

INSERT INTO schema_migrations (version, description)
VALUES ('002', 'Habilita RLS nas tabelas do pipeline e corrige SECURITY DEFINER view');

COMMIT;
