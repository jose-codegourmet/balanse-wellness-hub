# API contract pack (BE-024)

- Inventory: `packages/db/contracts/routes.ts` (BE-030…BE-043 from the roadmap).
- Artifact: `packages/db/contracts/openapi.json` (generated).
- Regenerate: `pnpm --filter @balanse/db db:openapi`
- CI: `@balanse/db` unit tests fail if a route or BE-001 enum is missing.

HTTP handlers are implemented in `@balanse/api` (BE-030–BE-043) and mounted on `apps/web` `/api/*`. FE screens still do not call them (no WIRE-*). See [api-routes.md](./api-routes.md).
