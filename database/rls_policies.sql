-- =============================================================================
-- ROW LEVEL SECURITY POLICIES — Page Revalida
-- =============================================================================
-- SECURITY: Cada policy é explícita por operação (SELECT/INSERT/UPDATE/DELETE).
--           Sem policy = sem acesso (default deny com RLS habilitado).
--
-- A aplicação DEVE executar antes de qualquer query na transação:
--   SET LOCAL app.current_user_id = '<uuid do usuário>';
--   SET LOCAL app.current_ip      = '<ip do cliente>';
-- =============================================================================

-- =============================================================================
-- TABELA: users
-- =============================================================================

-- SELECT: usuário vê apenas o próprio perfil; admin vê todos os ativos
CREATE POLICY users_select_own ON users
  FOR SELECT TO app_user
  USING (
    id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  );

CREATE POLICY users_select_admin ON users
  FOR SELECT TO app_admin
  USING (deleted_at IS NULL);

-- UPDATE: usuário edita apenas o próprio perfil
CREATE POLICY users_update_own ON users
  FOR UPDATE TO app_user
  USING (
    id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  )
  WITH CHECK (
    id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY users_update_admin ON users
  FOR UPDATE TO app_admin
  USING (TRUE);

-- INSERT: apenas a camada de autenticação (via app_admin) insere usuários
-- app_user não tem INSERT em users (criação de conta é operação privilegiada)
CREATE POLICY users_insert_admin ON users
  FOR INSERT TO app_admin
  WITH CHECK (TRUE);

-- =============================================================================
-- TABELA: sessions
-- =============================================================================

CREATE POLICY sessions_select_own ON sessions
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
    AND revoked_at IS NULL
    AND expires_at > NOW()
  );

CREATE POLICY sessions_insert_own ON sessions
  FOR INSERT TO app_user
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY sessions_update_own ON sessions
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY sessions_all_admin ON sessions
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: study_sessions
-- =============================================================================

CREATE POLICY study_sessions_select_own ON study_sessions
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  );

CREATE POLICY study_sessions_insert_own ON study_sessions
  FOR INSERT TO app_user
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY study_sessions_update_own ON study_sessions
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY study_sessions_all_admin ON study_sessions
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: user_answers
-- =============================================================================

CREATE POLICY user_answers_select_own ON user_answers
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY user_answers_insert_own ON user_answers
  FOR INSERT TO app_user
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY user_answers_update_own ON user_answers
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY user_answers_all_admin ON user_answers
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: streaks
-- =============================================================================

CREATE POLICY streaks_select_own ON streaks
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY streaks_insert_own ON streaks
  FOR INSERT TO app_user
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY streaks_update_own ON streaks
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY streaks_all_admin ON streaks
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: subscriptions
-- =============================================================================

CREATE POLICY subscriptions_select_own ON subscriptions
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  );

CREATE POLICY subscriptions_update_own ON subscriptions
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

-- SECURITY: app_user não pode criar/alterar plano diretamente
-- Inserções de assinatura são exclusivas do app_admin (webhook de pagamento)
CREATE POLICY subscriptions_all_admin ON subscriptions
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: materials
-- =============================================================================

CREATE POLICY materials_select_own ON materials
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  );

CREATE POLICY materials_insert_own ON materials
  FOR INSERT TO app_user
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY materials_update_own ON materials
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY materials_all_admin ON materials
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: generated_questions
-- =============================================================================

CREATE POLICY gen_questions_select_own ON generated_questions
  FOR SELECT TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
    AND deleted_at IS NULL
  );

CREATE POLICY gen_questions_insert_own ON generated_questions
  FOR INSERT TO app_user
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY gen_questions_update_own ON generated_questions
  FOR UPDATE TO app_user
  USING (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
  );

CREATE POLICY gen_questions_all_admin ON generated_questions
  FOR ALL TO app_admin
  USING (TRUE);

-- =============================================================================
-- TABELA: audit_logs
-- =============================================================================

-- SECURITY: Nenhum role de aplicação pode ler ou modificar audit_logs diretamente.
--           Apenas app_admin pode SELECT (relatórios de auditoria).
--           Inserções ocorrem via trigger (fn_audit_trigger) com permissão do owner.

CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT TO app_admin
  USING (TRUE);

-- app_user: sem acesso algum a audit_logs
-- (RLS habilitado + sem policy = deny implícito)
