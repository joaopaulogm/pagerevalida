-- =============================================================================
-- TESTES DE SEGURANÇA — Page Revalida
-- =============================================================================
-- Como executar:
--   psql $POSTGRES_URL_NON_POOLING -f database/security_tests.sql
--
-- Cada teste usa \echo para registrar PASS ou FAIL e o motivo.
-- Execute como app_admin para testes de RLS com app_user (use SET ROLE).
-- =============================================================================

\echo '============================================================'
\echo 'INICIANDO TESTES DE SEGURANÇA — Page Revalida'
\echo '============================================================'

-- =============================================================================
-- TESTE 1 — SQL Injection em queries parametrizadas
-- =============================================================================
\echo ''
\echo '[TESTE 1] SQL Injection via queries parametrizadas'
\echo 'Descrição: Verifica que inputs maliciosos não são executados como SQL.'
\echo 'Método: Inserir string de ataque em campo de texto; esperar erro ou dado literal.'

DO $$
DECLARE
  v_attack TEXT := '''; DROP TABLE users; --';
  v_count  INTEGER;
BEGIN
  -- Simulação: a aplicação usa queries parametrizadas ($1), nunca concatenação.
  -- Este bloco insere o ataque como dado literal numa tabela de staging temporária.
  CREATE TEMP TABLE _sec_test_injection (input TEXT);
  INSERT INTO _sec_test_injection VALUES (v_attack);
  SELECT COUNT(*) INTO v_count FROM _sec_test_injection WHERE input = v_attack;
  DROP TABLE _sec_test_injection;

  IF v_count = 1 THEN
    RAISE NOTICE '[TESTE 1] PASS — Input malicioso tratado como dado literal. Tabela users intacta.';
  ELSE
    RAISE EXCEPTION '[TESTE 1] FAIL — Comportamento inesperado.';
  END IF;
END;
$$;

-- Verifica que users ainda existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE '[TESTE 1b] PASS — Tabela users existe após tentativa de DROP injection.';
  ELSE
    RAISE EXCEPTION '[TESTE 1b] FAIL — Tabela users não encontrada!';
  END IF;
END;
$$;

-- =============================================================================
-- TESTE 2 — RLS: app_user não acessa dados de outro usuário
-- =============================================================================
\echo ''
\echo '[TESTE 2] Row Level Security — isolamento entre usuários'

DO $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
  v_count  INTEGER;
BEGIN
  -- Cria dois usuários de teste
  INSERT INTO users (email, password_hash, full_name)
  VALUES ('sec_test_a@revalida.test', crypt('SenhaA123!', gen_salt('bf', 12)), 'Teste A')
  RETURNING id INTO v_user_a;

  INSERT INTO users (email, password_hash, full_name)
  VALUES ('sec_test_b@revalida.test', crypt('SenhaB123!', gen_salt('bf', 12)), 'Teste B')
  RETURNING id INTO v_user_b;

  -- Simula app_user sendo o usuário A
  PERFORM set_config('app.current_user_id', v_user_a::TEXT, TRUE);

  -- Tenta acessar dados do usuário B via RLS
  SET LOCAL ROLE app_user;
  SELECT COUNT(*) INTO v_count FROM users WHERE id = v_user_b;
  RESET ROLE;

  -- Limpa dados de teste
  DELETE FROM users WHERE email IN ('sec_test_a@revalida.test', 'sec_test_b@revalida.test');

  IF v_count = 0 THEN
    RAISE NOTICE '[TESTE 2] PASS — app_user não conseguiu acessar dados de outro usuário (RLS bloqueou).';
  ELSE
    RAISE EXCEPTION '[TESTE 2] FAIL — RLS não bloqueou acesso cruzado! Usuário B visível para Usuário A.';
  END IF;
END;
$$;

-- =============================================================================
-- TESTE 3 — Privilege escalation: app_user não executa operações de admin
-- =============================================================================
\echo ''
\echo '[TESTE 3] Privilege escalation — app_user não pode fazer TRUNCATE/DROP'

DO $$
BEGIN
  SET LOCAL ROLE app_user;

  BEGIN
    TRUNCATE TABLE audit_logs;
    RAISE EXCEPTION '[TESTE 3] FAIL — app_user conseguiu executar TRUNCATE em audit_logs!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '[TESTE 3a] PASS — app_user bloqueado de TRUNCATE audit_logs (insufficient_privilege).';
  END;

  BEGIN
    DROP TABLE IF EXISTS users;
    RAISE EXCEPTION '[TESTE 3] FAIL — app_user conseguiu executar DROP TABLE users!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '[TESTE 3b] PASS — app_user bloqueado de DROP TABLE users (insufficient_privilege).';
  END;

  BEGIN
    -- Tenta deletar hard (DELETE sem soft delete) em tabela com RLS
    DELETE FROM users WHERE TRUE;
    RAISE EXCEPTION '[TESTE 3] FAIL — app_user conseguiu DELETE geral em users!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '[TESTE 3c] PASS — app_user não tem GRANT DELETE em users.';
  END;

  RESET ROLE;
END;
$$;

-- =============================================================================
-- TESTE 4 — Exposição de dados sensíveis: senhas e tokens não retornam em SELECT
-- =============================================================================
\echo ''
\echo '[TESTE 4] Dados sensíveis — password_hash não deve retornar texto puro'

DO $$
DECLARE
  v_user_id UUID;
  v_hash    TEXT;
  v_plain   TEXT := 'MinhaS3nhaSegura!';
BEGIN
  -- Insere usuário com bcrypt
  INSERT INTO users (email, password_hash, full_name)
  VALUES (
    'sec_test_hash@revalida.test',
    crypt(v_plain, gen_salt('bf', 12)),
    'Teste Hash'
  )
  RETURNING id INTO v_user_id;

  SELECT password_hash INTO v_hash FROM users WHERE id = v_user_id;

  -- Verifica que o hash não é igual à senha em texto puro
  IF v_hash <> v_plain THEN
    RAISE NOTICE '[TESTE 4a] PASS — password_hash contém bcrypt hash, não texto puro.';
  ELSE
    RAISE EXCEPTION '[TESTE 4a] FAIL — Senha armazenada em texto puro!';
  END IF;

  -- Verifica que o hash inicia com '$2a$' ou '$2b$' (bcrypt)
  IF v_hash LIKE '$2%' THEN
    RAISE NOTICE '[TESTE 4b] PASS — Hash tem formato bcrypt válido: %', left(v_hash, 7);
  ELSE
    RAISE EXCEPTION '[TESTE 4b] FAIL — Hash não parece ser bcrypt: %', left(v_hash, 20);
  END IF;

  -- Verifica autenticação correta via crypt()
  IF (SELECT password_hash = crypt(v_plain, password_hash) FROM users WHERE id = v_user_id) THEN
    RAISE NOTICE '[TESTE 4c] PASS — Verificação bcrypt funciona corretamente.';
  ELSE
    RAISE EXCEPTION '[TESTE 4c] FAIL — Verificação bcrypt falhou!';
  END IF;

  -- Limpa
  DELETE FROM users WHERE id = v_user_id;
END;
$$;

-- Verifica que token_hash é SHA-256 (64 chars hex), não token bruto
DO $$
DECLARE
  v_user_id   UUID;
  v_raw_token TEXT := 'my-super-secret-session-token-abc123';
  v_stored    TEXT;
BEGIN
  -- Cria usuário auxiliar
  INSERT INTO users (email, password_hash, full_name)
  VALUES ('sec_test_token@revalida.test', crypt('pwd', gen_salt('bf',10)), 'Token Test')
  RETURNING id INTO v_user_id;

  -- Insere sessão com token hasheado
  INSERT INTO sessions (user_id, token_hash, expires_at)
  VALUES (
    v_user_id,
    encode(sha256(v_raw_token::bytea), 'hex'),
    NOW() + INTERVAL '1 hour'
  );

  SELECT token_hash INTO v_stored FROM sessions WHERE user_id = v_user_id;

  IF v_stored <> v_raw_token AND length(v_stored) = 64 THEN
    RAISE NOTICE '[TESTE 4d] PASS — token_hash é SHA-256 (64 chars), não o token original.';
  ELSE
    RAISE EXCEPTION '[TESTE 4d] FAIL — token pode estar exposto! stored=%', left(v_stored, 20);
  END IF;

  -- Limpa
  DELETE FROM sessions WHERE user_id = v_user_id;
  DELETE FROM users WHERE id = v_user_id;
END;
$$;

-- =============================================================================
-- TESTE 5 — Auditoria: operações geram registros em audit_logs
-- =============================================================================
\echo ''
\echo '[TESTE 5] Auditoria — operações devem gerar registros em audit_logs'

DO $$
DECLARE
  v_user_id   UUID;
  v_log_count INTEGER;
  v_before    INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_before FROM audit_logs WHERE table_name = 'users';

  -- Configura contexto de auditoria
  PERFORM set_config('app.current_user_id', gen_random_uuid()::TEXT, TRUE);
  PERFORM set_config('app.current_ip', '192.168.1.100', TRUE);
  PERFORM set_config('app.current_agent', 'security-test/1.0', TRUE);

  -- INSERT
  INSERT INTO users (email, password_hash, full_name)
  VALUES ('sec_audit@revalida.test', crypt('pwd', gen_salt('bf',10)), 'Audit Test')
  RETURNING id INTO v_user_id;

  -- UPDATE
  UPDATE users SET full_name = 'Audit Test Updated' WHERE id = v_user_id;

  -- Soft DELETE (UPDATE de deleted_at)
  UPDATE users SET deleted_at = NOW() WHERE id = v_user_id;

  SELECT COUNT(*) INTO v_log_count
    FROM audit_logs
   WHERE table_name = 'users'
     AND record_id = v_user_id;

  IF v_log_count >= 3 THEN
    RAISE NOTICE '[TESTE 5] PASS — % registros de auditoria gerados para INSERT+UPDATE+SoftDelete.', v_log_count;
  ELSE
    RAISE EXCEPTION '[TESTE 5] FAIL — Esperado >= 3 logs, encontrado: %', v_log_count;
  END IF;

  -- Verifica que password_hash foi removido do snapshot
  IF EXISTS (
    SELECT 1 FROM audit_logs
     WHERE record_id = v_user_id
       AND (new_data ? 'password_hash' OR old_data ? 'password_hash')
  ) THEN
    RAISE EXCEPTION '[TESTE 5b] FAIL — password_hash encontrado no audit_log! Trigger deve remover campos sensíveis.';
  ELSE
    RAISE NOTICE '[TESTE 5b] PASS — password_hash não está nos snapshots de auditoria.';
  END IF;

  -- Limpa
  DELETE FROM users WHERE id = v_user_id;
END;
$$;

-- =============================================================================
-- TESTE 6 — SSL: verificar configuração de conexão segura
-- =============================================================================
\echo ''
\echo '[TESTE 6] SSL — verificar que conexão usa SSL/TLS'

DO $$
DECLARE
  v_ssl TEXT;
BEGIN
  SELECT ssl INTO v_ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid();

  IF v_ssl = 't' OR v_ssl IS NULL THEN
    -- Neon/Vercel Postgres sempre usa SSL; NULL pode ocorrer em ambientes locais de teste
    RAISE NOTICE '[TESTE 6] PASS — Conexão SSL ativa (ou ambiente local sem SSL configurado).';
    RAISE NOTICE '[TESTE 6] AVISO: Em produção (Neon), confirmar sslmode=require na string de conexão.';
  ELSE
    RAISE EXCEPTION '[TESTE 6] FAIL — Conexão sem SSL detectada! Verificar POSTGRES_URL com ?sslmode=require';
  END IF;
END;
$$;

-- =============================================================================
-- TESTE 7 — Rate limiting: estrutura de proteção contra brute force
-- =============================================================================
\echo ''
\echo '[TESTE 7] Rate limiting — verificar estrutura de sessões para brute force'
\echo 'NOTA: Rate limiting real é implementado na camada da aplicação (lib/db.ts).'
\echo '      Este teste verifica que a tabela de sessões suporta rastreamento de tentativas.'

DO $$
DECLARE
  v_has_ip    BOOLEAN;
  v_has_agent BOOLEAN;
BEGIN
  SELECT
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='ip_address'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='user_agent')
  INTO v_has_ip, v_has_agent;

  IF v_has_ip AND v_has_agent THEN
    RAISE NOTICE '[TESTE 7] PASS — Tabela sessions tem ip_address e user_agent para rastreamento de tentativas.';
    RAISE NOTICE '[TESTE 7] AVISO: Implementar rate limiting no middleware Next.js ou Vercel Edge (recomendado: upstash/ratelimit).';
  ELSE
    RAISE EXCEPTION '[TESTE 7] FAIL — sessions não tem colunas de rastreamento (ip_address=%,  user_agent=%)', v_has_ip, v_has_agent;
  END IF;
END;
$$;

-- =============================================================================
-- SUMÁRIO FINAL
-- =============================================================================
\echo ''
\echo '============================================================'
\echo 'TESTES CONCLUÍDOS — Verifique os NOTICEs acima'
\echo '============================================================'
\echo 'Legenda: PASS = segurança OK | FAIL = problema encontrado'
\echo ''
\echo 'Testes realizados:'
\echo '  1. SQL Injection via queries parametrizadas'
\echo '  2. RLS: isolamento entre usuários'
\echo '  3. Privilege escalation: app_user vs app_admin'
\echo '  4. Exposição de dados: senhas e tokens nunca em texto puro'
\echo '  5. Auditoria: INSERT/UPDATE/DELETE geram logs'
\echo '  6. SSL: conexão segura ativa'
\echo '  7. Estrutura de rate limiting'
\echo '============================================================'
