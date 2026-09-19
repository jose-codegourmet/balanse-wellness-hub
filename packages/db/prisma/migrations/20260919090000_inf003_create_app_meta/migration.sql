-- INF-003: trivial baseline table to prove the Prisma migrate loop.
-- Naming: YYYYMMDDHHMMSS_<ticket>_<verb>_<object>

CREATE TABLE "app_meta" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_meta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "app_meta_key_key" ON "app_meta"("key");
CREATE INDEX "app_meta_key_idx" ON "app_meta"("key");

-- RLS on every exposed public table (Supabase Data API). No policies here:
-- only the service role / Prisma (bypassing RLS) can read or write app_meta.
ALTER TABLE "app_meta" ENABLE ROW LEVEL SECURITY;

INSERT INTO "app_meta" ("id", "key", "value", "createdAt", "updatedAt")
VALUES ('cmappmeta0001inf003', 'schema_version', 'inf-003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
