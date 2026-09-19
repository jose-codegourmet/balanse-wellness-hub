import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: resolve(import.meta.dirname, "../.env"), quiet: true });
loadEnv({ path: resolve(import.meta.dirname, "../../../.env"), quiet: true });

/**
 * Re-applies INF-004 bucket DDL via DIRECT_URL.
 * Prefer `pnpm --filter @balanse/db db:deploy` so Prisma history stays the source of truth.
 */
async function main(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl || directUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("DIRECT_URL must be a real session connection (port 5432).");
  }

  const sql = readFileSync(
    resolve(
      import.meta.dirname,
      "../prisma/migrations/20260919090100_inf004_create_storage_buckets/migration.sql",
    ),
    "utf8",
  );

  const client = new pg.Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  const buckets = await client.query<{ id: string; public: boolean }>(
    "select id, public from storage.buckets where id in ('payment-proofs', 'coach-photos', 'marketing-assets') order by id",
  );
  console.log("[ok] storage buckets", buckets.rows);
  await client.end();
}

main().catch((error: unknown) => {
  console.error("[fail] ensure-storage-buckets", error);
  process.exit(1);
});
