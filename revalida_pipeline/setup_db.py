"""
Script auxiliar para criar as tabelas no banco de dados.
Executa o schema.sql diretamente via psycopg2 com timeout.

Uso:
    python setup_db.py
"""
import sys
import os
from pathlib import Path
from urllib.parse import urlparse, unquote

# Garante path correto
sys.path.insert(0, str(Path(__file__).parent))

# Carrega .env manualmente para evitar import de config (que pode travar)
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "")
SCHEMA_PATH = Path(__file__).parent / "schema.sql"

CONNECT_TIMEOUT = 15  # segundos


def parse_url(url: str) -> dict:
    """Parseia DATABASE_URL em parâmetros de conexão."""
    p = urlparse(url)
    return {
        "host": p.hostname,
        "port": p.port or 5432,
        "dbname": p.path.lstrip("/"),
        "user": unquote(p.username or ""),
        "password": unquote(p.password or ""),
        "connect_timeout": CONNECT_TIMEOUT,
        "sslmode": "require",  # Supabase exige SSL
    }


def run():
    if not DATABASE_URL:
        print("ERRO: DATABASE_URL não definida no .env")
        sys.exit(1)

    if not SCHEMA_PATH.exists():
        print(f"ERRO: schema.sql não encontrado em {SCHEMA_PATH}")
        sys.exit(1)

    print(f"Conectando ao banco...")
    print(f"Host: {urlparse(DATABASE_URL).hostname}")

    try:
        import psycopg2
    except ImportError:
        print("ERRO: psycopg2-binary não instalado. Execute: pip install psycopg2-binary")
        sys.exit(1)

    params = parse_url(DATABASE_URL)

    try:
        conn = psycopg2.connect(**params)
        conn.autocommit = True
        print("Conexão estabelecida!")
    except psycopg2.OperationalError as e:
        print(f"ERRO de conexão: {e}")
        print("\nVerifique:")
        print("  1. A senha no .env está correta")
        print("  2. O projeto Supabase está ativo")
        print("  3. Sua rede permite conexão na porta 5432")
        print("\nAlternativa: cole o schema.sql no SQL Editor do Supabase:")
        print("  https://supabase.com/dashboard/project/jjmmttruivwpydtgsivb/sql/new")
        sys.exit(1)

    sql = SCHEMA_PATH.read_text(encoding="utf-8")

    cur = conn.cursor()
    erros = 0
    avisos = 0

    # Executa statement por statement
    statements = [s.strip() for s in sql.split(";") if s.strip()]
    print(f"\nExecutando {len(statements)} statements SQL...")

    for i, stmt in enumerate(statements, 1):
        try:
            cur.execute(stmt)
            print(f"  [{i}/{len(statements)}] OK")
        except psycopg2.errors.DuplicateTable:
            print(f"  [{i}/{len(statements)}] Tabela já existe (ignorado)")
            avisos += 1
        except psycopg2.errors.DuplicateObject:
            print(f"  [{i}/{len(statements)}] Objeto já existe (ignorado)")
            avisos += 1
        except Exception as e:
            print(f"  [{i}/{len(statements)}] AVISO: {e}")
            erros += 1

    cur.close()
    conn.close()

    print(f"\n{'='*50}")
    if erros == 0:
        print(f"Banco configurado com sucesso! ({avisos} já existiam)")
    else:
        print(f"Concluído com {erros} erro(s) e {avisos} aviso(s)")
    print("="*50)


if __name__ == "__main__":
    run()
