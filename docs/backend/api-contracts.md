# API contract pack (BE-024)

- Inventory: `packages/db/contracts/routes.ts` (BE-030…BE-043 plus BE-050–BE-054 amendments).
- Artifact: `packages/db/contracts/openapi.json` (generated).
- Shared TS types: `@balanse/domain` (`CursorPage`, `ValidationFailedBody`, `FIELD_CONSTRAINTS`, `MetricSeries`, `SignedUploadIntent`).
- Regenerate: `pnpm --filter @balanse/db db:openapi`
- CI: `@balanse/db` unit tests fail if a route or BE-001 enum is missing.

Amendments:

| Ticket | Doc |
| --- | --- |
| BE-050 | [admin-pagination.md](./admin-pagination.md) |
| BE-051 | [validation-contracts.md](./validation-contracts.md) |
| BE-052 | [uploads.md](./uploads.md) |
| BE-053 | [settings-write.md](./settings-write.md) |
| BE-054 | [dashboard-metrics.md](./dashboard-metrics.md) |

HTTP handlers are implemented in `@balanse/api` and mounted on `apps/web` `/api/*`. FE screens still do not call them (no WIRE-*). See [api-routes.md](./api-routes.md).
