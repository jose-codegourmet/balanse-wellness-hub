# API routes (BE-030–BE-043 + BE-050–058 + #292 staff auth + #320 events)

HTTP handlers live in `@balanse/api` and are mounted on `apps/web` at `/api/*` (`src/app/api/[[...path]]/route.ts`). Screens stay mock-only this phase — no FE `fetch` to these routes (`WIRE-*` later).

Contract inventory: `packages/db/contracts/routes.ts`. OpenAPI: `packages/db/contracts/openapi.json`.

## Recurring schedules (BE-057 / #288)

`POST /api/admin/sessions/duplicate` copies non-cancelled sessions from an inclusive source range of at most 63 days to a new start date. `POST /api/admin/sessions/{id}/recurrence` stores a bounded weekly rule (one or more weekdays, at most one year) and eagerly creates ordinary session rows. Both endpoints are admin-only, default generated sessions to `DRAFT`, skip exact class/start-time matches, reject inactive class/coach references, capture current coach rates, and never copy bookings.

## Session bundles (BE-058 / #290)

Public catalogue `GET /api/public/packages`. Customer owned packages, free claim, paid acquisition + proof, eligible entitlements, and `POST /api/bookings` with `entitlementId`. Admin bundle CRUD/status, grant/revoke, paid-acquisition review. See [session-bundles.md](./session-bundles.md). Screens do not call these routes yet.

Authorisation matches RLS (`docs/backend/rls-policies.md`): Prisma uses the service/owner role and **bypasses RLS**, so every handler re-checks the caller.

Screens continue to use `getMockAdapter()` for catalogue and ledger UX.

## Session events (#320)

Admin HTTP contracts only. No public or customer event routes, and no screen calls these handlers. Shapes live in `packages/domain/src/contracts.ts` (`AdminEvent`, `AdminEventSessionSnapshot`, `EVENT_STATUS_LABELS`, `EVENT_CONFLICT_CODES`) and are re-exported from `@balanse/api`.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/admin/events` | `events.read` or `events.manage` |
| `POST` | `/api/admin/events` | `events.manage` |
| `GET` | `/api/admin/events/{id}` | `events.read` or `events.manage` |
| `PATCH` | `/api/admin/events/{id}` | `events.manage` |
| `POST` | `/api/admin/events/{id}/publish` | `events.manage` |
| `POST` | `/api/admin/events/{id}/cancel` | `events.manage` |
| `POST` | `/api/admin/events/{id}/archive` | `events.manage` |

Dispatch maps every route in `ADMIN_API_ACCESS` before the handler runs. Each handler then checks the same permission again before any event or session read. Missing permission, role, or an inactive staff member is denied. Service-role Prisma is not authorization. This matches RLS: select needs `events.read`, `events.manage`, or Super Admin; writes need `events.manage` or Super Admin. Coach has neither key.

`GET /api/admin/events` filters with `status`, `sessionId` (alias `session`), and an optional session-start window `from` / `to` (`dateFrom` / `dateTo` accepted; `to` is exclusive). Ordering is upcoming-first: sessions that have not started yet, soonest first, then past sessions, most recent first.

Create always inserts `DRAFT`. A second event for the same session returns `409 event_session_taken`. A `CANCELLED` session returns `409 event_on_cancelled_session`. Publish returns `409 event_publish_requires_published_session` unless the session status is `PUBLISHED` (this blocks a `DRAFT` session). A repeated publish, cancel, or archive of the current status does not write again and does not add an audit row.

`PATCH` changes event copy only. `startsAt`, `endsAt`, `capacity`, `customerPrice`, coach fields, and `sessionId` are `422 read_only`. Status changes go through the action routes. Content edits do not write `audit_events`.

Create and status changes set transaction-local `app.actor_staff_id` and rely on `app_private.audit_session_event_status` for exactly one `audit_events` row (`event.create` or `event.status`). Handlers do not insert a second row.

`POST /api/admin/sessions/{id}/cancel` sets a `DRAFT` or `PUBLISHED` event on that session to `CANCELLED` in the same transaction. Archived and already-cancelled events are left unchanged. Cancelling or archiving an event does not cancel the session or its bookings.

Responses use `EventStatus` / `SessionStatus` plus `statusLabel`. The nested session snapshot has schedule, capacity, and price only — no coach compensation. See [session-events.md](./session-events.md).

## Customer vs admin

- Customer routes require a Supabase access token (`Authorization: Bearer`). The attendee is always `auth.users.id`. `customerId` / attendee fields are rejected.
- There is **no** customer route that sets `CANCELLED`. Cancellation and reschedule are requests only.
- Admin routes require an active, non-system `staff_members` row whose `roleId` is an active `staff_role_definitions` row. Authorization is the request-scoped staff actor (user/staff IDs, status, role ID/key, permissions, linked `coachId`, auth method). Disabled or archived-role staff lose access on the next request.
- Every `/api/admin/*` handler is mapped in `ADMIN_API_ACCESS` (`@balanse/domain`). Dispatch denies unmapped routes. Read permissions never authorize writes. Own-scope never implies all-scope.
- Front Desk allow-list APIs succeed; privileged APIs (rates, refunds, reports, staff/roles, settings) return 403.
- Coach own-session reads/attendance succeed; other session IDs return 403. Roster payloads omit rates and payment fields the actor cannot see.
- Role CRUD: `GET/POST /api/admin/roles`, `GET/PATCH /api/admin/roles/{id}`, clone, archive, `GET /api/admin/permissions`, `POST /api/admin/staff/{id}/role`. No privilege escalation, no archived-role assignment, Coach role requires a linked coach, last active Super Admin cannot be disabled/demoted (`app_private.assert_last_super_admin_safe`, Prisma count fallback if the helper is missing). Changes write `audit_events` with actor/target/before/after. Rejected last-SA attempts write `staff.last_super_admin.rejected`. Permission mapping: `ADMIN_API_ACCESS` in `@balanse/domain` (OpenAPI does not duplicate the keys). Closeout: [authorization-closeout.md](./authorization-closeout.md).

## OQ-2 (reschedule) — deliberately not enforced

Documented on `POST /api/bookings/{id}/reschedule-request` and admin approve:

- Target class type is not validated.
- Price difference is not computed or charged.
- Target cutoff is not validated on the customer request.
- Reschedule-count limits are not enforced.

Approve still re-checks **capacity** (`target_session_full`).

OQ-1: customer cancellation has **no** eligibility window and no placeholder deadline.

## Payment proof re-upload

`POST /api/bookings/{id}/payment-proof` without `objectKey` issues a signed upload (jpeg/png/webp/heic, 5 MiB). With `objectKey` it replaces `payments.proofObjectKey`, sets payment `PROOF_SUBMITTED` and booking `PAYMENT_SUBMITTED`, and **never** `CONFIRMED`. Prior keys are written to `audit_events` (`payment.proof` / `payment.proof.replace`). History is retained; proofs are not appended as extra payment rows.

## Admin customer reads

`GET /api/admin/customers/{id}` is operational-only and writes `audit_events.action = customer.read`. See `CUSTOMER_SENSITIVE_READ_POLICY` in `@balanse/api`.

## Reports performance budget

Date range is required, half-open (same as BE-022), and capped at 366 days. Session-performance rows are paginated (`page` / `pageSize`, max 100).

Field names match `docs/screen-specs/admin/14-sales-inventory-reports.md` (Gross Sales, Refunds, Net Sales, Paid Bookings, Coach Cost, Gross Contribution, Occupancy, Attendance Utilisation). No field named `profit`.

## Settings

Four independently saveable sections (BE-053): business profile, payment, public content, policy promote. Hold duration and booking cutoff are **absent**. Nested `contact.phone`/`address` vs `contact.email` are partial-safe. FAQs are rows in `faqs` with `sortOrder`. New policy versions are inserted; prior versions stay immutable (`isCurrent` flips; partial unique index). See [settings-write.md](./settings-write.md).

Payment receive QRs are a first-class collection (BE-056): `GET/POST /api/admin/settings/payment-qrs`, `PATCH` / `POST …/activate` / `DELETE` on `/{id}`. Exactly one active non-archived row. `qrImageKey` / `gcashQrObjectKey` are read-only derived. See [payment-qr-collection.md](./payment-qr-collection.md).

## Staff / coach capability (BE-055)

`POST` / `DELETE /api/admin/staff/{id}/coach` links a teaching profile to a staff account. `isCoach` / `coachId` appear on staff payloads; `staffId` on admin coach payloads. Not a `StaffRole` value. See [staff-coach-unification.md](./staff-coach-unification.md).

## Admin lists (BE-050)

`GET /api/admin/bookings`, `/payments`, `/cancellation-requests`, `/reschedule-requests` return `CursorPage` (`items`, `nextCursor`, `totalCount`). See [admin-pagination.md](./admin-pagination.md).

## Uploads (BE-052)

Signed upload + confirm on coach photo and GCash QR. See [uploads.md](./uploads.md).

## Dashboard (BE-054)

`GET /api/admin/dashboard` and `/api/admin/dashboard/metrics` — operational scalars + 14-day Manila series. Not a substitute for `/api/admin/reports/*`. See [dashboard-metrics.md](./dashboard-metrics.md).

## Validation (BE-051)

Admin writes return **422** `ValidationFailed` (`fieldErrors` / `formErrors`). See [validation-contracts.md](./validation-contracts.md).
