import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BOOKING_STATUSES } from "@balanse/domain";
import { describe, expect, it } from "vitest";
import { API_CONTRACT_ROUTES } from "../../contracts/routes";

const dbRoot = resolve(import.meta.dirname, "../..");

describe("BE-024 API contract pack", () => {
  it("covers every inventoried route and BE-001 enums", () => {
    execFileSync("pnpm", ["exec", "tsx", "scripts/generate-openapi.ts"], {
      cwd: dbRoot,
      stdio: "pipe",
    });
    const spec = JSON.parse(readFileSync(resolve(dbRoot, "contracts/openapi.json"), "utf8"));
    for (const route of API_CONTRACT_ROUTES) {
      expect(spec.paths[route.path]?.[route.method], `${route.method} ${route.path}`).toBeTruthy();
    }
    expect(spec.components.schemas.BookingStatus.enum).toEqual([...BOOKING_STATUSES]);
    expect(JSON.stringify(spec)).not.toMatch(/profit/i);
  });
});
