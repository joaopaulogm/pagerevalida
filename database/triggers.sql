-- =============================================================================
-- TRIGGERS DE AUDITORIA — Page Revalida
-- =============================================================================
-- SECURITY: Todas as tabelas críticas geram registros imutáveis em audit_logs.
--           O trigger captura user_id via current_setting('app.current_user_id')
--           definido pela aplicação com SET LOCAL no início de cada transação.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Função genérica de auditoria
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER  -- SECURITY: INVOKER, não DEFINER — sem escalada de privilégio
AS $$
DECLARE
  v_user_id   UUID;
  v_ip        INET;
  v_agent     TEXT;
  v_old_data  JSONB;
  v_new_data  JSONB;
  v_record_id UUID;
BEGIN
  -- Lê contexto da transação definido pela aplicação
  -- SECURITY: current_setting retorna '' se não definido; tratamos com NULLIF
  v_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
  v_ip      := NULLIF(current_setting('app.current_ip', TRUE), '')::INET;
  v_agent   :=        current_setting('app.current_agent', TRUE);

  -- Captura dados e ID do registro
  IF TG_OP = 'INSERT' THEN
    v_new_data  := to_jsonb(NEW);
    v_record_id := (NEW).id;
    v_old_data  := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data  := to_jsonb(OLD);
    v_new_data  := to_jsonb(NEW);
    v_record_id := (NEW).id;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_data  := to_jsonb(OLD);
    v_new_data  := NULL;
    v_record_id := (OLD).id;
  END IF;

  -- SECURITY: Remove campos sensíveis do snapshot antes de gravar
  IF v_old_data IS NOT NULL THEN
    v_old_data := v_old_data
      - 'password_hash'
      - 'cpf_encrypted'
      - 'external_subscription_id'
      - 'token_hash';
  END IF;
  IF v_new_data IS NOT NULL THEN
    v_new_data := v_new_data
      - 'password_hash'
      - 'cpf_encrypted'
      - 'external_subscription_id'
      - 'token_hash';
  END IF;

  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    actor_user_id,
    actor_ip,
    actor_agent,
    occurred_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP::audit_operation,
    v_record_id,
    v_old_data,
    v_new_data,
    v_user_id,
    v_ip,
    v_agent,
    NOW()
  );

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Aplica trigger de auditoria nas tabelas críticas
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users',
    'sessions',
    'subscriptions',
    'user_answers',
    'study_sessions',
    'materials',
    'generated_questions'
  ] LOOP
    -- Remove trigger anterior se existir (idempotência em re-execução)
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit ON %I', tbl, tbl);

    EXECUTE format(
      'CREATE TRIGGER trg_%s_audit
       AFTER INSERT OR UPDATE OR DELETE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- Trigger especial: normaliza email para lowercase antes de INSERT/UPDATE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_normalize_email()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_normalize_email ON users;
CREATE TRIGGER trg_users_normalize_email
  BEFORE INSERT OR UPDATE OF email ON users
  FOR EACH ROW EXECUTE FUNCTION fn_normalize_email();

-- -----------------------------------------------------------------------------
-- Trigger: atualiza streak automaticamente ao registrar uma resposta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_streak()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_today         DATE := CURRENT_DATE;
  v_last_date     DATE;
  v_current       INTEGER;
  v_longest       INTEGER;
BEGIN
  SELECT last_study_date, current_streak, longest_streak
    INTO v_last_date, v_current, v_longest
    FROM streaks
   WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    -- Primeiro registro de resposta do usuário
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date)
    VALUES (NEW.user_id, 1, 1, v_today);
    RETURN NEW;
  END IF;

  IF v_last_date = v_today THEN
    -- Já estudou hoje, não altera streak
    RETURN NEW;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Dia consecutivo
    v_current := v_current + 1;
  ELSE
    -- Sequência quebrada
    v_current := 1;
  END IF;

  v_longest := GREATEST(v_longest, v_current);

  UPDATE streaks
     SET current_streak  = v_current,
         longest_streak  = v_longest,
         last_study_date = v_today
   WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_answers_streak ON user_answers;
CREATE TRIGGER trg_user_answers_streak
  AFTER INSERT ON user_answers
  FOR EACH ROW EXECUTE FUNCTION fn_update_streak();

-- -----------------------------------------------------------------------------
-- Trigger: recalcula contadores da sessão de estudo
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_study_session_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.study_session_id IS NOT NULL THEN
    UPDATE study_sessions
       SET questions_count = questions_count + 1,
           correct_count   = correct_count + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)
     WHERE id = NEW.study_session_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_answers_session_counts ON user_answers;
CREATE TRIGGER trg_user_answers_session_counts
  AFTER INSERT ON user_answers
  FOR EACH ROW EXECUTE FUNCTION fn_update_study_session_counts();
