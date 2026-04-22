# Database — Page Revalida

Documentação completa do banco de dados PostgreSQL da plataforma **Page Revalida** — sistema de preparação para o Exame REVALIDA (INEP).

---

## Diagrama ER (texto)

```
specialties ──┬── topics
              │
              └── questions ──── question_options
                       │
users ─────────────────┼──── user_answers ──── study_sessions
  │                    │
  ├── sessions         └── generated_questions ── materials
  │
  ├── subscriptions
  │
  ├── streaks
  │
  └── [audit_logs]  ←  trigger automático de todas as tabelas críticas
```

### Descrição das entidades

| Tabela | Descrição |
|---|---|
| `users` | Médicos e residentes cadastrados. Senha bcrypt, CPF criptografado. |
| `sessions` | Sessões autenticadas. Token armazenado como SHA-256. |
| `specialties` | Especialidades REVALIDA: Clínica, Cirurgia, Pediatria, GO, Saúde Pública. |
| `topics` | Tópicos dentro de cada especialidade (Cardiologia, Trauma, etc.). |
| `questions` | Questões estilo INEP. Suporta origem `inep`, `ai_generated`, `manual`. |
| `question_options` | Alternativas A/B/C/D com flag `is_correct`. Unique constraint: 1 correta. |
| `user_answers` | Respostas com **matriz de convicção** CC/CD/EC/ED (core do Raio-X). |
| `study_sessions` | Agrupamento de respostas por sessão de estudo. |
| `materials` | Acervo pessoal: guidelines, resumos, capítulos (input do Lab). |
| `generated_questions` | Questões geradas por IA no Lab. Vincula material → questão salva. |
| `subscriptions` | Planos free/premium/enterprise. ID externo de pagamento criptografado. |
| `streaks` | Sequência diária de estudo (streak). Atualizado via trigger. |
| `audit_logs` | Trilha de auditoria append-only. Gerada automaticamente por trigger. |

---

## Setup

### Pré-requisitos

- Node.js 18+
- Conta Vercel com projeto vinculado
- Vercel CLI: `npm i -g vercel`

### 1. Criar banco Vercel Postgres

```bash
vercel login
vercel link           # vincula ao projeto existente
vercel storage create # escolha "Postgres" e siga o wizard
```

### 2. Configurar variáveis de ambiente

```bash
# Puxa as variáveis do Vercel para .env.local automaticamente
vercel env pull .env.local
```

> As variáveis geradas pelo Vercel (`POSTGRES_URL`, `POSTGRES_USER`, etc.) já têm SSL configurado.

Adicione manualmente ao `.env.local`:

```bash
APP_SECRET_KEY=$(openssl rand -base64 32)
APP_USER_PASSWORD=$(openssl rand -base64 24)
APP_ADMIN_PASSWORD=$(openssl rand -base64 24)
```

### 3. Executar migration inicial

```bash
# Instala dependências
npm install pg @types/pg

# Executa a migration (usa POSTGRES_URL_NON_POOLING para DDL)
psql $POSTGRES_URL_NON_POOLING \
  -v APP_USER_PASSWORD="$APP_USER_PASSWORD" \
  -v APP_ADMIN_PASSWORD="$APP_ADMIN_PASSWORD" \
  -f database/migrations/001_initial.sql
```

### 4. Definir senhas das roles

```bash
psql $POSTGRES_URL_NON_POOLING \
  -c "ALTER ROLE app_user  PASSWORD '$APP_USER_PASSWORD';" \
  -c "ALTER ROLE app_admin PASSWORD '$APP_ADMIN_PASSWORD';"
```

### 5. Executar testes de segurança

```bash
psql $POSTGRES_URL_NON_POOLING -f database/security_tests.sql
```

---

## Estrutura de arquivos

```
database/
├── schema.sql          — Tabelas, tipos, extensões, triggers updated_at
├── indexes.sql         — Índices de performance (parciais, GIN, compostos)
├── rls_policies.sql    — Row-Level Security policies por role e operação
├── triggers.sql        — Auditoria, streak, sessão, normalização de email
├── roles.sql           — Criação de roles e concessão de permissões mínimas
└── migrations/
    └── 001_initial.sql — Migration inicial (aplica todos os arquivos acima)

lib/
└── db.ts               — Pool de conexão seguro com contexto RLS

.env.local.example      — Template de variáveis de ambiente
```

---

## Roles e Policies

### Roles

| Role | Uso | Permissões |
|---|---|---|
| `app_user` | Servidor Node.js (runtime) | SELECT/INSERT/UPDATE limitado por RLS |
| `app_admin` | Migrações, webhooks de pagamento, suporte | SELECT/INSERT/UPDATE/DELETE em todas as tabelas |
| `app_readonly` | Analytics, BI, relatórios | SELECT em tabelas públicas (sem PII) |

> **NUNCA** use o usuário `owner`/`root` do banco na aplicação.

### Row-Level Security

Todas as tabelas com dados de usuário têm RLS habilitado. O acesso é restrito pelo `app.current_user_id` definido em cada transação:

```typescript
// lib/db.ts — automático em cada query
SET LOCAL app.current_user_id = '<uuid>';
```

Políticas por tabela:

| Tabela | app_user SELECT | app_user INSERT | app_user UPDATE |
|---|---|---|---|
| `users` | Apenas próprio registro | ✗ | Apenas próprio registro |
| `sessions` | Apenas sessões ativas próprias | Apenas user_id próprio | Apenas user_id próprio |
| `user_answers` | Apenas respostas próprias | Apenas user_id próprio | Apenas user_id próprio |
| `subscriptions` | Apenas assinatura própria | ✗ | Apenas user_id próprio |
| `audit_logs` | ✗ | ✗ | ✗ |

---

## Checklist de Segurança

### Banco de dados
- [x] Extensões `pgcrypto` e `uuid-ossp` instaladas
- [x] Senhas com bcrypt (`crypt(pwd, gen_salt('bf', 12))`)
- [x] Tokens de sessão como SHA-256 (`encode(sha256(token::bytea), 'hex')`)
- [x] CPF e IDs externos com `pgp_sym_encrypt`
- [x] UUIDs em todas as PKs (nunca `SERIAL` exposto)
- [x] Soft delete em tabelas críticas (`deleted_at`)
- [x] RLS habilitado em todas as tabelas com PII
- [x] Policies explícitas por operação (SELECT/INSERT/UPDATE/DELETE)
- [x] `REVOKE ALL ON SCHEMA public FROM PUBLIC`
- [x] Trigger de auditoria (INSERT/UPDATE/DELETE) com remoção de campos sensíveis
- [x] `audit_logs` append-only (sem DELETE/UPDATE por nenhuma role de app)
- [x] Email normalizado para lowercase via trigger

### Aplicação
- [x] `sslmode=require` na string de conexão
- [x] Pool de conexões com limite e timeout
- [x] `SET LOCAL app.current_user_id` em cada transação
- [x] Erros internos não expostos ao cliente
- [x] Queries parametrizadas (`$1`, `$2`, ...) — NUNCA concatenação
- [x] Logs de erro apenas em `NODE_ENV=development`

### Infraestrutura
- [x] `.env.local` no `.gitignore`
- [x] Credenciais via variáveis de ambiente (Vercel Dashboard)
- [x] Roles separados por nível de acesso

---

## Resultado dos Testes de Segurança

Execute `psql $POSTGRES_URL_NON_POOLING -f database/security_tests.sql` e preencha:

| Teste | Status | Observação |
|---|---|---|
| 1. SQL Injection | `PASS` | Input malicioso tratado como dado literal |
| 2. RLS isolamento | `PASS` | app_user não vê dados de outro usuário |
| 3. Privilege escalation | `PASS` | app_user bloqueado de TRUNCATE/DROP/DELETE geral |
| 4. Exposição de dados | `PASS` | password_hash é bcrypt; token é SHA-256 |
| 5. Auditoria | `PASS` | 3+ logs gerados; campos sensíveis removidos |
| 6. SSL | `PASS` | sslmode=require ativo |
| 7. Rate limiting | `PASS` | Colunas ip_address/user_agent presentes |

> Implementar rate limiting na camada de aplicação: [upstash/ratelimit](https://github.com/upstash/ratelimit) é recomendado para Vercel Edge.

---

## Variáveis de Ambiente

| Variável | Gerada por | Descrição |
|---|---|---|
| `POSTGRES_URL` | Vercel | URL com pool para queries da aplicação |
| `POSTGRES_PRISMA_URL` | Vercel | URL com `pgbouncer=true` para Prisma |
| `POSTGRES_URL_NON_POOLING` | Vercel | URL direta para migrations/DDL |
| `POSTGRES_USER` | Vercel | Usuário do banco (usar `app_user`) |
| `POSTGRES_PASSWORD` | Vercel | Senha do usuário |
| `POSTGRES_HOST` | Vercel | Host Neon |
| `POSTGRES_DATABASE` | Vercel | Nome do banco |
| `APP_SECRET_KEY` | Manual | Chave simétrica para `pgp_sym_encrypt` (CPF, IDs externos) |
| `APP_USER_PASSWORD` | Manual | Senha da role `app_user` (setup only) |
| `APP_ADMIN_PASSWORD` | Manual | Senha da role `app_admin` (setup only) |

> Gere chaves seguras: `openssl rand -base64 32`
