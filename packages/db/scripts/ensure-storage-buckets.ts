import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import pg from "pg";

loadEnv({ path: resolve(import.meta.dirname, "../.env"), quiet: true });
loadEnv({ path: resolve(import.meta.dirname, "../../../.env"), quiet: true });

/** Idempotent bucket migrations, replayed in order (INF-004, #344 avatars). */
const BUCKET_MIGRATIONS = [
  "20260919090100_inf004_create_storage_buckets",
  "20261001090000_be344_create_avatars_bucket",
] as const;

/**
 * Re-applies bucket DDL via DIRECT_URL.
 * Prefer `pnpm --filter @balanse/db db:deploy` so Prisma history stays the source of truth.
 */
async function main(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl || directUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("DIRECT_URL must be a real session connection (port 5432).");
  }

  const client = new pg.Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  for (const migration of BUCKET_MIGRATIONS) {
    const sql = readFileSync(
      resolve(import.meta.dirname, `../prisma/migrations/${migration}/migration.sql`),
      "utf8",
    );
    await client.query(sql);
  }
  const buckets = await client.query<{ id: string; public: boolean }>(
    "select id, public from storage.buckets where id in ('payment-proofs', 'coach-photos', 'marketing-assets', 'avatars') order by id",
  );
  console.log("[ok] storage buckets", buckets.rows);
  await client.end();
}

main().catch((error: unknown) => {
  console.error("[fail] ensure-storage-buckets", error);
  process.exit(1);
});
