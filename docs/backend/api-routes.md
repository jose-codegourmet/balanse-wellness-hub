# API routes (BE-030–BE-043 + BE-050–058 + #292 staff auth + #320 events)

HTTP handlers live in `@balanse/api` and are mounted on `apps/web` at `/api/*` (`src/app/api/[[...path]]/route.ts`). Screens call typed `@balanse/api-client` functions through React Query or server-side client calls.

Contract inventory: `packages/db/contracts/routes.ts`. OpenAPI: `packages/db/contracts/openapi.json`.

## Customer profile and avatar

`GET /api/me` returns the signed-in customer's editable profile: separate names,
nickname, roster visibility, referral code/channel, onboarding status, and a
short-lived avatar URL. `PATCH /api/me` accepts only customer-editable profile
fields; email remains owned by the authentication provider.

`POST /api/me/avatar` with `{ contentType }` mints a private `avatars` upload.
After uploading the cropped image bytes to the returned signed URL, repeat the
same request with `{ objectKey }` to confirm it. `DELETE /api/me/avatar` clears
the image. All three routes require the customer bearer token and only act on
that token's profile.

## Customer onboarding

`GET /api/me/onboarding` returns the customer's saved answers or `null` when
the wizard has not started. `PATCH /api/me/onboarding` accepts a partial set of
answers, upserts `profile_onboarding`, and replaces class interests when
`interestClassIds` is supplied. The three `*Other` fields are capped at 120
characters. `POST /api/me/onboarding/complete` and `/skip` stamp the customer's
completion or skip timestamp. All four routes are owner-only; referral channel
is returned with `GET /api/me`.

## Recurring schedules (BE-057 / #288)

`POST /api/admin/sessions/duplicate` copies non-cancelled sessions from an inclusive source range of at most 63 days to a new start date. `POST /api/admin/sessions/{id}/recurrence` stores a bounded weekly rule (one or more weekdays, at most one year) and eagerly creates ordinary session rows. Both endpoints are admin-only, default generated sessions to `DRAFT`, skip exact class/start-time matches, reject inactive class/coach/venue references, copy the source session's venue, capture current coach rates, and never copy bookings.

## Classes

| Method | Path | Permission (any of) |
| --- | --- | --- |
| `GET` | `/api/admin/classes` | `classes.read`, `classes.manage` |
| `POST` | `/api/admin/classes` | `classes.manage` |
| `PATCH` | `/api/admin/classes/{id}` | `classes.manage` |
| `DELETE` | `/api/admin/classes/{id}` | `classes.manage` + Super Admin role |
| `POST` | `/api/admin/class-images` | `classes.manage` |

`DELETE` is a hard delete for Super Admins only (other roles get `403`). A class with any session or bundle applicability returns `409 class_in_use` (`details.sessions` / `details.bundles`); deactivate it instead. Marketing coach links and customer class interests cascade. Writes one `class.delete` audit row. Class image uploads: see [uploads.md](./uploads.md).

## Venues

| Method | Path | Permission (any of) |
| --- | --- | --- |
| `GET` | `/api/admin/venues` | `classes.read`, `classes.manage`, `schedule.read.all`, `schedule.read.own`, `events.read`, `events.manage` |
| `POST` | `/api/admin/venues` | `classes.manage` |
| `PATCH` | `/api/admin/venues/{id}` | `classes.manage` |

`GET` returns `{ items: AdminVenue[] }` (active first, then name), filterable by `active=true|false` and `kind=BRANCH|OFFSITE`. `POST` requires `name` and `kind`; a case-insensitive duplicate name returns `409 conflict`. There is no delete; set `active: false`. Sessions: `POST /api/admin/sessions` requires an active `venueId`; `PATCH` may keep an inactive current venue but cannot switch to an inactive one (`422 inactive_reference`, unknown id `404 venue_not_found`). Overlapping session times are allowed. See [venues.md](./venues.md).

## Session bundles (BE-058 / #290)

Public catalogue `GET /api/public/packages`. Customer owned packages, free claim, paid acquisition + proof, eligible entitlements, and `POST /api/bookings` with `entitlementId`. Admin bundle CRUD/status, grant/revoke, paid-acquisition review. See [session-bundles.md](./session-bundles.md).

Authorisation matches RLS (`docs/backend/rls-policies.md`): Prisma uses the service/owner role and **bypasses RLS**, so every handler re-checks the caller.

Storybook stories use `getMockAdapter()` for fixture-driven catalogue and ledger previews.

## Session events (#320 / WIRE-E13)

Admin event authoring and the public event page use the API client. Shapes live in `packages/domain/src/contracts.ts` (`AdminEvent`, `PublicEventPage`, `AdminEventSessionSnapshot`, `EVENT_CONFLICT_CODES`) and are re-exported from `@balanse/api`.

| Method | Path | Permission |
| --- | --- | --- |
| `GET` | `/api/admin/events` | `events.read` or `events.manage` |
| `POST` | `/api/admin/events` | `events.manage` |
| `POST` | `/api/admin/events/{id}/images` | `events.manage` |
| `GET` | `/api/admin/events/{id}` | `events.read` or `events.manage` |
| `PATCH` | `/api/admin/events/{id}` | `events.manage` |
| `POST` | `/api/admin/events/{id}/publish` | `events.manage` |
| `POST` | `/api/admin/events/{id}/cancel` | `events.manage` |
| `POST` | `/api/admin/events/{id}/archive` | `events.manage` |
| `GET` | `/api/public/events/{id}` | public |

Dispatch maps every route in `ADMIN_API_ACCESS` before the handler runs. Each handler then checks the same permission again before any event or session read. Missing permission, role, or an inactive staff member is denied. Service-role Prisma is not authorization. This matches RLS: select needs `events.read`, `events.manage`, or Super Admin; writes need `events.manage` or Super Admin. Coach has neither key.

`GET /api/admin/events` filters with `status`, `sessionId` (alias `session`), title/summary `search`, and an optional session-start window `from` / `to` (`dateFrom` / `dateTo` accepted; `to` is exclusive). Ordering is upcoming-first: sessions that have not started yet, soonest first, then past sessions, most recent first.

Create always inserts `DRAFT`. A second event for the same session returns `409 event_session_taken`. A `CANCELLED` session returns `409 event_on_cancelled_session`. A session that has already started (`startsAt <= now`) returns `409 event_on_started_session`; existing events on past sessions stay editable. Publish returns `409 event_publish_requires_published_session` unless the session status is `PUBLISHED` (this blocks a `DRAFT` session). A repeated publish, cancel, or archive of the current status does not write again and does not add an audit row.

`PATCH` changes event copy only. `startsAt`, `endsAt`, `capacity`, `customerPrice`, coach fields, venue fields (`venueId`, `venue`, `venueName`, `venueAddress`), and `sessionId` are `422 read_only`; the same keys are rejected on create. Status changes go through the action routes. Content edits do not write `audit_events`.

`POST /api/admin/events/{id}/images` is the BE-052 mint/confirm lifecycle for JPEG, PNG, and WebP event media. It mints `marketing-assets/events/<eventId>/<uuid>.<ext>`; confirming claims the upload, then the normal event PATCH selects it as the poster or one of at most 12 gallery images. Seeded site paths and uploaded object keys both render on public reads.

`GET /api/public/events/{id}` reads only `app_public.public_event`. It returns published/cancelled event copy plus the nested public session page, returns 404 for draft/archived/unknown data, and never returns `internalNotes` or `isPlaceholder`.

Create and status changes set transaction-local `app.actor_staff_id` and rely on `app_private.audit_session_event_status` for exactly one `audit_events` row (`event.create` or `event.status`). Handlers do not insert a second row.

`POST /api/admin/sessions/{id}/cancel` sets a `DRAFT` or `PUBLISHED` event on that session to `CANCELLED` in the same transaction. Archived and already-cancelled events are left unchanged. Cancelling or archiving an event does not cancel the session or its bookings.

Coach class change requests use `GET /api/admin/class-change-requests`, `GET /api/admin/sessions/{id}/substitute-coaches`, `POST /api/admin/sessions/{id}/class-change-requests`, and `POST /api/admin/class-change-requests/{id}/withdraw|approve|deny`. The API enforces coach ownership, the request kind's approval permission, and the ban on self-review. See [class-change-requests.md](./class-change-requests.md).

Responses use `EventStatus` / `SessionStatus` plus `statusLabel`. The nested session snapshot has schedule, capacity, price, and the session's venue (`venue: { id, name, address, kind }`) — no coach compensation and no venue notes. See [session-events.md](./session-events.md).

## Customer vs admin

- Customer routes require a Supabase access token (`Authorization: Bearer`). The attendee is always `auth.users.id`. `customerId` / attendee fields are rejected.
- There is **no** customer route that sets `CANCELLED`. Cancellation and reschedule are requests only.
- Admin routes require an active, non-system `staff_members` row whose `roleId` is an active `staff_role_definitions` row. Authorization is the request-scoped staff actor (user/staff IDs, status, role ID/key, permissions, linked `coachId`, auth method). Disabled or archived-role staff lose access on the next request.
- Every `/api/admin/*` handler is mapped in `ADMIN_API_ACCESS` (`@balanse/domain`). Dispatch denies unmapped routes. Read permissions never authorize writes. Own-scope never implies all-scope.
- Front Desk allow-list APIs succeed, including its explicitly granted financial dashboard, refund, coach-rate read, coach-cost/session report, role-read, and content-settings capabilities. Staff administration, role changes, and ungranted settings still return 403.
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

## Counter cash and payment approval (2026-10-13)

- `POST /api/admin/payments/{id}/record-cash` with `{ "confirm": true }` records the cash (`CASH_RECEIVED`) and confirms the booking in one transaction. It requires `bookings.confirm` in addition to the route's record-cash access, and returns `409 booking_not_confirmable` unless the booking is `HELD_AWAITING_PAYMENT` or `PAYMENT_SUBMITTED`. Without the flag it only records the cash, as before.
- `POST /api/admin/bookings/{id}/confirm` marks the booking's latest payment `VERIFIED` in the same transaction when it is `PROOF_SUBMITTED` (GCash approval), and audits `payment.verify`.
- `POST /api/admin/payments/{id}/reject-proof` `{ "reason" }` (`payments.review`) rejects a GCash receipt only: the payment becomes `REJECTED`, a `PAYMENT_SUBMITTED` booking returns to `HELD_AWAITING_PAYMENT` with its original hold, and the reason is kept on the `payment.reject` audit row. The customer's `GET /api/bookings/{id}` returns it as `rejectReason`, and they can upload a new receipt. `POST /api/admin/bookings/{id}/reject` still rejects the whole booking (and a submitted proof with it).
- `GET /api/admin/payments?tab=counter` lists only held bookings not paying by GCash. Confirmed counter bookings leave the queue; check-in happens on the session roster.

## Transactions ledger (#378)

`GET /api/admin/transactions` (`payments.read`) is the read model behind admin `/transactions`; the page no longer composes rows from the bookings queue. It returns one `TransactionRecord` (`@balanse/domain`) per booking payment with a status other than `NONE`, per refund in `REFUND_PENDING` / `REFUNDED`, and per `CUSTOMER_PAID` package acquisition with a recorded payment: type, status (`Completed` / `Pending` / `Rejected` / `Cancelled`), method, amount, source-created time, reference, and a link to the booking or customer. A booking payment is `Completed` under the `countsTowardGrossSales` rule (`VERIFIED` or `CASH_RECEIVED` on a booking that is no longer held or waitlisted); package purchases are `Completed` once approved.

Query: `tab` (`all` default, `payments`, `refunds`, `pending`), `q` (customer name, booking reference, or description), `limit`, `cursor` (sort `sourceCreatedAt_desc_id_desc`; malformed → 400 `invalid_cursor`). The envelope is `CursorPage` plus `totals` (`receivedPhp`, `refundedPhp`, `netPhp`, `pendingCount`) computed over every record **before** `tab`, `q`, and the cursor apply, so the summary never changes while filtering or paging. The ledger is built in one pass per request and sliced in memory (studio scale); refund rows and refund totals are omitted for a caller without `refunds.read`. Dates are source creation times (booking reservation, package request), not settlement times.

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

## Marketing insights (WIRE-1901)

`GET /api/admin/marketing-insights?from&to` — `reports.marketing.read` aggregate-only sign-up, onboarding, interest, and referral counts. The response contains no profile ids, names, emails, or top-referrer data.

## Coach students (WIRE-2101)

`GET /api/admin/coach/students` and `GET /api/admin/coach/students/{customerId}` — built-in Coach-only reads, scoped server-side to the signed-in staff member's linked coach profile. They return only students in that coach's sessions; contribution is verified/cash booking value or consumed-package class value, never sales, payroll, or profit. Detail onboarding omits referral and heard-from attribution.

## Validation (BE-051)

Admin writes return **422** `ValidationFailed` (`fieldErrors` / `formErrors`). See [validation-contracts.md](./validation-contracts.md).
