import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import pg from "pg";

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../prisma/migrations");
const FOLDER_PATTERN = /^(\d{14})_(.+)$/;

export type RepoMigration = {
  folder: string;
  slug: string;
  checksum: string;
};

export type PrismaMigrationRow = {
  migration_name: string;
  checksum: string;
  finished_at: Date | string | null;
  rolled_back_at: Date | string | null;
};

export type SupabaseMigrationRow = {
  version: string;
  name: string | null;
};

export type DriftReport = {
  unapplied: RepoMigration[];
  checksumMismatches: Array<{ folder: string; expected: string; actual: string }>;
  incompletePrisma: string[];
  supabaseOnly: RepoMigration[];
  prismaVerified: RepoMigration[];
};

export function migrationSlug(folder: string): string {
  const match = FOLDER_PATTERN.exec(folder);
  if (!match?.[2]) {
    throw new Error(
      `Migration folder '${folder}' must be named YYYYMMDDHHMMSS_<slug> so it can be matched to Supabase history.`,
    );
  }
  return match[2];
}

export function evaluateDrift(
  repo: RepoMigration[],
  prismaRows: PrismaMigrationRow[],
  supabaseRows: SupabaseMigrationRow[],
): DriftReport {
  if (repo.length === 0) {
    throw new Error("No migration folders found. Refusing to treat an empty directory as in sync.");
  }

  const prismaByName = new Map(prismaRows.map((row) => [row.migration_name, row]));
  const supabaseNames = new Set(
    supabaseRows.flatMap((row) => {
      if (!row.name) return [];
      return [row.name, `${row.version}_${row.name}`];
    }),
  );

  const report: DriftReport = {
    unapplied: [],
    checksumMismatches: [],
    incompletePrisma: [],
    supabaseOnly: [],
    prismaVerified: [],
  };

  for (const migration of repo) {
    const prismaRow = prismaByName.get(migration.folder);
    if (prismaRow) {
      const finished = prismaRow.finished_at != null && prismaRow.rolled_back_at == null;
      if (!finished) {
        report.incompletePrisma.push(migration.folder);
        continue;
      }
      if (prismaRow.checksum !== migration.checksum) {
        report.checksumMismatches.push({
          folder: migration.folder,
          expected: migration.checksum,
          actual: prismaRow.checksum,
        });
        continue;
      }
      report.prismaVerified.push(migration);
      continue;
    }

    if (supabaseNames.has(migration.slug) || supabaseNames.has(migration.folder)) {
      report.supabaseOnly.push(migration);
      continue;
    }

    report.unapplied.push(migration);
  }

  return report;
}

export function driftBlocksDeploy(report: DriftReport): boolean {
  return (
    report.unapplied.length > 0 ||
    report.checksumMismatches.length > 0 ||
    report.incompletePrisma.length > 0
  );
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`self-check failed: ${message}`);
}

export function selfCheck(): void {
  const pending: RepoMigration = {
    folder: "20261020120000_session_change_rules",
    slug: "session_change_rules",
    checksum: "abc",
  };
  const supabaseApplied: RepoMigration = {
    folder: "20261008114619_wire_e16_policy_forms",
    slug: "wire_e16_policy_forms",
    checksum: "def",
  };
  const prismaApplied: RepoMigration = {
    folder: "20261005090000_wire1701_payment_account_fields",
    slug: "wire1701_payment_account_fields",
    checksum: "111",
  };
  const mismatched: RepoMigration = {
    folder: "20260919090000_inf003_create_app_meta",
    slug: "inf003_create_app_meta",
    checksum: "expected",
  };
  const unfinished: RepoMigration = {
    folder: "20261013190000_staff_coach_role_check_on_commit",
    slug: "staff_coach_role_check_on_commit",
    checksum: "ignored",
  };

  const report = evaluateDrift(
    [pending, supabaseApplied, prismaApplied, mismatched, unfinished],
    [
      {
        migration_name: prismaApplied.folder,
        checksum: prismaApplied.checksum,
        finished_at: "2026-10-13T00:00:00.000Z",
        rolled_back_at: null,
      },
      {
        migration_name: mismatched.folder,
        checksum: "recorded",
        finished_at: "2026-09-19T00:00:00.000Z",
        rolled_back_at: null,
      },
      {
        migration_name: "20261013190000_staff_coach_role_check_on_commit",
        checksum: "ignored",
        finished_at: null,
        rolled_back_at: null,
      },
    ],
    [
      { version: "20261009043628", name: "wire_e16_policy_forms" },
      { version: "20260919092014", name: "be017_018_capacity_jobs_core" },
    ],
  );

  assert(
    report.unapplied.map((item) => item.folder).join() === pending.folder,
    "unapplied migration",
  );
  assert(
    report.supabaseOnly.map((item) => item.folder).join() === supabaseApplied.folder,
    "supabase name match",
  );
  assert(
    report.prismaVerified.map((item) => item.folder).join() === prismaApplied.folder,
    "prisma checksum match",
  );
  assert(report.checksumMismatches.length === 1, "checksum mismatch");
  assert(report.incompletePrisma.length === 1, "unfinished prisma row");
  assert(driftBlocksDeploy(report), "drift blocks deploy");
  assert(migrationSlug(pending.folder) === pending.slug, "slug");

  let emptyThrew = false;
  try {
    evaluateDrift([], [], []);
  } catch {
    emptyThrew = true;
  }
  assert(emptyThrew, "empty migration directory");
}

function publicError(error: unknown, directUrl: string): string {
  let message = error instanceof Error ? error.message : String(error);
  if (directUrl) message = message.split(directUrl).join("[REDACTED]");
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[REDACTED_URL]");
}

function requireDirectUrl(): string {
  const value = process.env.DIRECT_URL;
  if (!value) {
    throw new Error(
      "DIRECT_URL is not set. Add the GitHub Actions secret DIRECT_URL (direct Postgres URL, port 5432). This check does not apply migrations.",
    );
  }
  if (value.includes("[YOUR-PASSWORD]") || value.includes("REPLACE_ME")) {
    throw new Error("DIRECT_URL still contains a placeholder. Refusing to deploy.");
  }
  return value;
}

async function loadRepoMigrations(): Promise<RepoMigration[]> {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const migrations: RepoMigration[] = [];
  for (const folder of folders) {
    const sql = await readFile(resolve(MIGRATIONS_DIR, folder, "migration.sql"));
    migrations.push({
      folder,
      slug: migrationSlug(folder),
      checksum: createHash("sha256").update(sql).digest("hex"),
    });
  }
  return migrations;
}

function printReport(report: DriftReport): void {
  const covered = report.prismaVerified.length + report.supabaseOnly.length;
  console.log(
    `Production migration history covers ${covered} repo migration(s) (${report.prismaVerified.length} checksum-verified in _prisma_migrations, ${report.supabaseOnly.length} by Supabase name only).`,
  );

  if (report.supabaseOnly.length > 0) {
    console.log(
      "::warning::These repo migrations are in Supabase history but missing from _prisma_migrations. They count as applied. Do not re-run their SQL. Record them with prisma migrate resolve --applied before any migrate deploy.",
    );
    for (const migration of report.supabaseOnly) {
      console.log(`::warning::supabase-history-only ${migration.folder}`);
    }
  }

  if (!driftBlocksDeploy(report)) return;

  console.error(
    "::error::Refusing to deploy. This git ref expects database changes that are not on production, or a recorded checksum does not match the migration file. This workflow does not apply SQL. See docs/backend/production-schema-drift.md",
  );
  for (const migration of report.unapplied) {
    console.error(
      `::error::Unapplied migration ${migration.folder} (Supabase name ${migration.slug}). Not in _prisma_migrations or supabase_migrations.schema_migrations.`,
    );
  }
  for (const folder of report.incompletePrisma) {
    console.error(
      `::error::Incomplete _prisma_migrations row for ${folder} (not finished, or rolled back).`,
    );
  }
  for (const mismatch of report.checksumMismatches) {
    console.error(
      `::error::Checksum mismatch for ${mismatch.folder}. File ${mismatch.expected}, database ${mismatch.actual}.`,
    );
  }
}

async function main(): Promise<void> {
  selfCheck();
  if (process.argv.includes("--self-check")) {
    console.log("migration drift self-check passed");
    return;
  }

  loadEnv({ path: resolve(import.meta.dirname, "../.env"), quiet: true });
  loadEnv({ path: resolve(import.meta.dirname, "../../../.env"), quiet: true });

  const directUrl = requireDirectUrl();
  const repo = await loadRepoMigrations();
  const client = new pg.Client({
    connectionString: directUrl,
    connectionTimeoutMillis: 15_000,
    ssl: { rejectUnauthorized: false },
    application_name: "balanse-migration-drift-guard",
  });

  try {
    await client.connect();
    await client.query("set statement_timeout = 15000");
    const prisma = await client.query<PrismaMigrationRow>(
      `select migration_name, checksum, finished_at, rolled_back_at
       from public._prisma_migrations
       order by migration_name`,
    );
    const supabase = await client.query<SupabaseMigrationRow>(
      `select version, name
       from supabase_migrations.schema_migrations
       order by version`,
    );
    const report = evaluateDrift(repo, prisma.rows, supabase.rows);
    printReport(report);
    if (driftBlocksDeploy(report)) process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  const directUrl = process.env.DIRECT_URL ?? "";
  console.error(`::error::${publicError(error, directUrl)}`);
  console.error(
    "::error::Production migration check failed closed. Deploy aborted. This workflow does not apply SQL.",
  );
  process.exit(1);
});
