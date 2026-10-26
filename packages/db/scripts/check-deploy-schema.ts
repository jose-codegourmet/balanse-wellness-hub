import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { Prisma } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import pg from "pg";

/** Read-only compatibility gate; never applies SQL migrations or reads customer rows. */
async function main() {
  const { values } = parseArgs({
    options: {
      "deployment-env": { type: "string" },
      "production-only": { type: "boolean" },
    },
  });
  if (values["production-only"] && process.env.VERCEL_ENV !== "production") {
    console.log("Deployment schema check skipped outside Vercel production.");
    return;
  }
  if (values["deployment-env"]) {
    // Check exactly the selected Vercel project's production configuration.
    const loaded = loadEnv({ path: resolve(values["deployment-env"]), quiet: true });
    if (loaded.error || !loaded.parsed?.DATABASE_URL) {
      throw new Error("The deployment env file must exist and contain DATABASE_URL.");
    }
    process.env.DATABASE_URL = loaded.parsed.DATABASE_URL;
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  if (process.env.DATABASE_URL.includes("[SENSITIVE]")) {
    throw new Error(
      "DATABASE_URL is a redacted Vercel secret. Use a remote production build so Vercel supplies the real credential.",
    );
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15_000,
    statement_timeout: 15_000,
  });
  let checking = "database connection";
  try {
    await client.connect();
    await client.query("BEGIN READ ONLY");
    const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
    for (const model of Prisma.dmmf.datamodel.models) {
      const table = model.dbName ?? model.name;
      checking = `public.${table}`;
      const columns = model.fields
        .filter((field) => field.kind !== "object")
        .map((field) => quote(field.dbName ?? field.name));
      // LIMIT 0 still resolves every column, including when the table is empty.
      await client.query(`SELECT ${columns.join(", ")} FROM public.${quote(table)} LIMIT 0`);
    }

    // These SQL-only report contracts are not represented in the Prisma models.
    const reports = [
      ['"classId"', "report_class_performance_v2(NULL::timestamptz, NULL::timestamptz)"],
      ['"coachId"', "report_coach_costs(NULL::timestamptz, NULL::timestamptz)"],
      ['"sessionId"', "report_session_performance(NULL::timestamptz, NULL::timestamptz)"],
      ['"sessionId", "className", name, "startsAt"', "report_session_drilldown(NULL::text)"],
    ];
    for (const [columns, report] of reports) {
      checking = report;
      await client.query(`SELECT ${columns} FROM public.${report} LIMIT 0`);
    }
    await client.query("ROLLBACK");
    console.log(
      `Deployment schema check passed: ${Prisma.dmmf.datamodel.models.length} models and ${reports.length} report contracts.`,
    );
  } catch (error) {
    // Do not print connection strings, error details, or query results to CI logs.
    const code = error instanceof pg.DatabaseError ? error.code : undefined;
    throw new Error(
      `Deployment schema check failed at ${checking}${code ? ` (SQLSTATE ${code})` : ""}. Check connectivity and apply/reconcile the reviewed migrations before deploying.`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Deployment schema check failed.");
  process.exitCode = 1;
});
