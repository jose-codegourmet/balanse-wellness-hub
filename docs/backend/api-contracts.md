# API contract pack (BE-024)

- Inventory: `packages/db/contracts/routes.ts` (BE-030…BE-043 plus BE-050–BE-058 and #292 role routes).
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
| BE-055 | [staff-coach-unification.md](./staff-coach-unification.md) |
| BE-056 | [payment-qr-collection.md](./payment-qr-collection.md) |
| BE-058 | [session-bundles.md](./session-bundles.md) |
| #292 / BE-289 | [api-routes.md](./api-routes.md), [staff-roles.md](./staff-roles.md) |

HTTP handlers are implemented in `@balanse/api` and mounted on `apps/web` `/api/*`. FE screens still do not call them (no WIRE-*). See [api-routes.md](./api-routes.md).

## Future public share contracts (#343 / #345) — not implemented this phase

The database read surface exists (`app_public.*`, see [rls-policies.md](./rls-policies.md#public-read-functions-345)). These routes are **not** in `packages/db/contracts/routes.ts` and have no `@balanse/api` handler yet; screens stay on `MockDataAdapter`. Response shapes must match the #346 domain types in `@balanse/domain` (camelCase; the handler maps the snake_case function columns).

| Route | Source | Response (sketch) |
| --- | --- | --- |
| `GET /api/public/sessions/{id}` | `app_public.public_session` | Session facts: class id/name/slug, optional title, start/end, capacity, `remainingSlots`, price, status, venue name + address, coaches (`id`, `name`, `specialties`, `photoKey`), linked event (`id`, `title`, `status`) or null. 404 for `DRAFT` / unknown. |
| `GET /api/public/events/{id}` | `app_public.public_event` | Event copy (`title`, `summary`, `description`, `posterImage`, `galleryImages`, `beneficiary`, `whatToBring`, registration window, effective `status`) + the session facts above. 404 for `DRAFT` / `ARCHIVED` / unknown. Never `internalNotes` / `isPlaceholder`. |
| `GET /api/public/sessions/{id}/roster` | `app_public.public_session_roster` | `{ goingCount, spotsLeft, hiddenCount, attendees: [{ rowKey, displayName, avatarUrl, initials, isSelf }] }`. Anon: `attendees: []`, `hiddenCount: 0`. `avatarUrl` is a ~10-minute signed URL minted server-side for `avatar_key`; the raw key is not returned. Never last name, email, contact, profile id, booking id, booking/payment status, or booking time. |

Canonical redirects (stale slug/date segments → 301 keeping `ref` / `via` / `src`) are a page concern, not part of these contracts.
