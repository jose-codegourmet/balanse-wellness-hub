import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 6 skips automatic .env loading when prisma.config.ts is present.
loadEnv({ path: resolve(import.meta.dirname, ".env"), quiet: true });
loadEnv({ path: resolve(import.meta.dirname, "../../.env"), quiet: true });

/**
 * Prisma CLI config for Prisma 6.19+.
 * Datasource URLs stay in `prisma/schema/schema.prisma` so Prisma Client
 * on the current major continues to resolve `DATABASE_URL` / `DIRECT_URL`.
 */
export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
