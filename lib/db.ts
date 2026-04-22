/**
 * Conexão segura com PostgreSQL (Vercel Postgres / Neon)
 * SECURITY: SSL obrigatório, sem credenciais hardcoded, erros não expostos ao cliente
 */
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// SECURITY: Todas as credenciais vêm de variáveis de ambiente — nunca hardcoded
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: true, // SECURITY: valida certificado do servidor
  },
  max: 10,                    // máximo de conexões simultâneas
  idleTimeoutMillis: 30_000,  // fecha conexão ociosa após 30s
  connectionTimeoutMillis: 5_000, // falha se não conectar em 5s
  statement_timeout: 10_000,  // cancela query após 10s
  query_timeout: 10_000,
});

// Log apenas em desenvolvimento — nunca em produção
pool.on('error', (err) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('[db] pool error:', err.message);
  }
});

/**
 * Contexto de execução passado por cada request autenticado.
 * A aplicação DEVE fornecer userId em toda query que envolva dados de usuário.
 */
export interface QueryContext {
  userId?: string;   // UUID do usuário autenticado
  clientIp?: string; // IP do cliente (para auditoria)
  userAgent?: string;
}

/**
 * Executa uma query parametrizada com contexto de RLS.
 *
 * SECURITY: Use SEMPRE esta função em vez de pool.query direto.
 *           Nunca concatene valores em `sql` — passe sempre em `params`.
 *
 * @example
 * // CORRETO:
 * await query('SELECT id FROM users WHERE email = $1', ['user@example.com'], ctx)
 *
 * // ERRADO (SQL Injection):
 * await query(`SELECT id FROM users WHERE email = '${email}'`, [], ctx)
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  ctx?: QueryContext,
): Promise<QueryResult<T>> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // SECURITY: Define contexto de RLS para esta transação
    // SET LOCAL: escopo restrito à transação atual
    if (ctx?.userId) {
      await client.query('SET LOCAL app.current_user_id = $1', [ctx.userId]);
    }
    if (ctx?.clientIp) {
      await client.query('SET LOCAL app.current_ip = $1', [ctx.clientIp]);
    }
    if (ctx?.userAgent) {
      await client.query('SET LOCAL app.current_agent = $1', [ctx.userAgent ?? '']);
    }

    const result = await client.query<T>(sql, params);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});

    if (process.env.NODE_ENV === 'development') {
      console.error('[db] query error:', err);
    }

    // SECURITY: Não exponha detalhes internos do banco ao cliente
    throw new Error('Erro ao processar a requisição. Tente novamente.');
  } finally {
    client.release();
  }
}

/**
 * Executa múltiplas queries em uma única transação.
 * Útil para operações que precisam de atomicidade.
 */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
  ctx?: QueryContext,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (ctx?.userId) {
      await client.query('SET LOCAL app.current_user_id = $1', [ctx.userId]);
    }
    if (ctx?.clientIp) {
      await client.query('SET LOCAL app.current_ip = $1', [ctx.clientIp]);
    }
    if (ctx?.userAgent) {
      await client.query('SET LOCAL app.current_agent = $1', [ctx.userAgent ?? '']);
    }

    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});

    if (process.env.NODE_ENV === 'development') {
      console.error('[db] transaction error:', err);
    }

    throw new Error('Erro ao processar a requisição. Tente novamente.');
  } finally {
    client.release();
  }
}

/**
 * Verifica a saúde da conexão com o banco.
 * Usar em health-check endpoints: GET /api/health
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export default pool;
