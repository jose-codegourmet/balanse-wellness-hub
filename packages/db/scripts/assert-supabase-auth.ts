/**
 * Preflight before applying migrations to the hosted Supabase project.
 * Localhost / CI disposable Postgres skips this on purpose.
 */

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const isLocal =
  url.includes("127.0.0.1") ||
  url.includes("localhost") ||
  process.env.BALANSE_SKIP_SUPABASE_AUTH === "1";

if (isLocal) {
  console.log("Skipping Supabase auth preflight (local/CI database).");
  process.exit(0);
}

if (!url.includes("xydundrayuusqizssgby")) {
  console.log("Skipping Supabase auth preflight (not the Balanse project URL).");
  process.exit(0);
}

console.log("Hosted Balanse project detected — proceed with migrate deploy.");
