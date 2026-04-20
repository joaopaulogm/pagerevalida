-- =============================================================================
-- ÍNDICES DE PERFORMANCE — Page Revalida
-- =============================================================================
-- Convenção:
--   idx_<tabela>_<coluna(s)>         — índice simples/composto
--   idx_<tabela>_<coluna>_partial    — índice parcial (filtra deleted_at/is_active)
--   idx_<tabela>_<coluna>_gin        — índice GIN para JSONB ou texto
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
-- Busca por email (login)
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users (email)
  WHERE deleted_at IS NULL;

-- Busca por plano (dashboard admin)
CREATE INDEX IF NOT EXISTS idx_users_plan_type
  ON users (plan_type)
  WHERE deleted_at IS NULL;

-- Usuários ativos recentes (onboarding, relatórios)
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at DESC)
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- sessions
-- -----------------------------------------------------------------------------
-- Validação de sessão (lookup por token_hash em cada request)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_hash
  ON sessions (token_hash)
  WHERE deleted_at IS NULL AND revoked_at IS NULL;

-- Sessões ativas por usuário
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_active
  ON sessions (user_id, expires_at)
  WHERE deleted_at IS NULL AND revoked_at IS NULL;

-- Limpeza de sessões expiradas (job periódico)
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions (expires_at)
  WHERE revoked_at IS NULL;

-- -----------------------------------------------------------------------------
-- specialties / topics
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_specialties_slug
  ON specialties (slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_topics_specialty_id
  ON topics (specialty_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_specialty_slug
  ON topics (specialty_id, slug)
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- questions
-- -----------------------------------------------------------------------------
-- Filtro principal do banco de questões
CREATE INDEX IF NOT EXISTS idx_questions_specialty_id
  ON questions (specialty_id)
  WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_topic_id
  ON questions (topic_id)
  WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_source_difficulty
  ON questions (source, difficulty)
  WHERE deleted_at IS NULL AND is_active = TRUE;

-- INEP: busca por ano/prova
CREATE INDEX IF NOT EXISTS idx_questions_inep_year
  ON questions (inep_year)
  WHERE source = 'inep' AND deleted_at IS NULL;

-- GIN para busca full-text e filtros em metadata JSONB
CREATE INDEX IF NOT EXISTS idx_questions_metadata_gin
  ON questions USING GIN (metadata);

-- Busca textual no enunciado
CREATE INDEX IF NOT EXISTS idx_questions_content_fts
  ON questions USING GIN (to_tsvector('portuguese', content));

-- -----------------------------------------------------------------------------
-- question_options
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_question_options_question_id
  ON question_options (question_id);

-- Busca pela alternativa correta (frequente em correção automática)
CREATE INDEX IF NOT EXISTS idx_question_options_correct
  ON question_options (question_id, is_correct)
  WHERE is_correct = TRUE;

-- -----------------------------------------------------------------------------
-- study_sessions
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id
  ON study_sessions (user_id, started_at DESC)
  WHERE deleted_at IS NULL;

-- Sessões abertas (ended_at IS NULL = em andamento)
CREATE INDEX IF NOT EXISTS idx_study_sessions_open
  ON study_sessions (user_id, started_at)
  WHERE ended_at IS NULL AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- user_answers
-- -----------------------------------------------------------------------------
-- Core: respostas do usuário por questão (matriz de convicção / Raio-X)
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id
  ON user_answers (user_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_answers_question_id
  ON user_answers (question_id);

CREATE INDEX IF NOT EXISTS idx_user_answers_session_id
  ON user_answers (study_session_id)
  WHERE study_session_id IS NOT NULL;

-- Filtros do dashboard: convicção, acerto
CREATE INDEX IF NOT EXISTS idx_user_answers_conviction
  ON user_answers (user_id, conviction);

CREATE INDEX IF NOT EXISTS idx_user_answers_is_correct
  ON user_answers (user_id, is_correct);

-- Heatmap por especialidade (join com questions → specialties)
CREATE INDEX IF NOT EXISTS idx_user_answers_user_question
  ON user_answers (user_id, question_id);

-- -----------------------------------------------------------------------------
-- streaks
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_streaks_user_id
  ON streaks (user_id);

-- -----------------------------------------------------------------------------
-- subscriptions
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions (status, expires_at)
  WHERE deleted_at IS NULL;

-- Expiração (job de renovação/notificação)
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at
  ON subscriptions (expires_at)
  WHERE status = 'active' AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- materials
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_materials_user_id
  ON materials (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_materials_specialty_id
  ON materials (specialty_id)
  WHERE deleted_at IS NULL;

-- GIN para busca em metadata e full-text
CREATE INDEX IF NOT EXISTS idx_materials_metadata_gin
  ON materials USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_materials_content_fts
  ON materials USING GIN (to_tsvector('portuguese', content));

-- -----------------------------------------------------------------------------
-- generated_questions
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gen_questions_user_id
  ON generated_questions (user_id, generated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_gen_questions_material_id
  ON generated_questions (material_id)
  WHERE deleted_at IS NULL;

-- Questões salvas pelo usuário
CREATE INDEX IF NOT EXISTS idx_gen_questions_saved
  ON generated_questions (user_id, is_saved)
  WHERE is_saved = TRUE AND deleted_at IS NULL;

-- Deduplicação por hash do prompt
CREATE INDEX IF NOT EXISTS idx_gen_questions_prompt_hash
  ON generated_questions (prompt_hash)
  WHERE prompt_hash IS NOT NULL;

-- -----------------------------------------------------------------------------
-- audit_logs
-- -----------------------------------------------------------------------------
-- Busca por tabela + operação (relatórios de auditoria)
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_op
  ON audit_logs (table_name, operation, occurred_at DESC);

-- Auditoria por usuário
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
  ON audit_logs (actor_user_id, occurred_at DESC)
  WHERE actor_user_id IS NOT NULL;

-- Auditoria por registro específico
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id
  ON audit_logs (record_id)
  WHERE record_id IS NOT NULL;

-- GIN para busca em snapshots JSONB (forense/compliance)
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_data_gin
  ON audit_logs USING GIN (old_data)
  WHERE old_data IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_new_data_gin
  ON audit_logs USING GIN (new_data)
  WHERE new_data IS NOT NULL;
