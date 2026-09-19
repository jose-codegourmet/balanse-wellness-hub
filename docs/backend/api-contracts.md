# API contract pack (BE-024)

- Inventory: `packages/db/contracts/routes.ts` (BE-030…BE-043 from the roadmap).
- Artifact: `packages/db/contracts/openapi.json` (generated).
- Regenerate: `pnpm --filter @balanse/db db:openapi`
- CI: `@balanse/db` unit tests fail if a route or BE-001 enum is missing.

HTTP handlers are **not** implemented in this phase (no FE↔BE wiring). Examples use the same enum names and a fixture-shaped booking payload. Wiring tickets consume this file.
