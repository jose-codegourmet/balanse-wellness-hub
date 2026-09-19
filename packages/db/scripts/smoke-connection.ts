import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: resolve(import.meta.dirname, "../.env"), quiet: true });
loadEnv({ path: resolve(import.meta.dirname, "../../../.env"), quiet: true });

function requireUrl(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Copy packages/db/.env.example to packages/db/.env`);
  }
  if (value.includes("[YOUR-PASSWORD]") || value.includes("REPLACE_ME")) {
    throw new Error(
      `${name} still contains a placeholder. Fill in local secrets (never commit them).`,
    );
  }
  return value;
}

async function probe(label: string, connectionString: string): Promise<void> {
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const result = await client.query<{
    current_database: string;
    server_version: string;
  }>("select current_database(), current_setting('server_version') as server_version");
  const row = result.rows[0];
  console.log(`[ok] ${label} reached ${row.current_database} (Postgres ${row.server_version})`);
  await client.end();
}

async function main(): Promise<void> {
  const databaseUrl = requireUrl("DATABASE_URL");
  const directUrl = requireUrl("DIRECT_URL");

  await probe("DATABASE_URL (pooled :6543)", databaseUrl);
  await probe("DIRECT_URL (direct :5432)", directUrl);
}

main().catch((error: unknown) => {
  console.error("[fail] connection smoke", error);
  process.exit(1);
});
