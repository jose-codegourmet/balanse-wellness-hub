# API routes (BE-030–BE-043)

HTTP handlers live in `@balanse/api` and are mounted on `apps/web` at `/api/*` (`src/app/api/[[...path]]/route.ts`). Screens stay mock-only this phase — no FE `fetch` to these routes (`WIRE-*` later).

Contract inventory: `packages/db/contracts/routes.ts`. OpenAPI: `packages/db/contracts/openapi.json`.

Authorisation matches RLS (`docs/backend/rls-policies.md`): Prisma uses the service/owner role and **bypasses RLS**, so every handler re-checks the caller.

## Customer vs admin

- Customer routes require a Supabase access token (`Authorization: Bearer`). The attendee is always `auth.users.id`. `customerId` / attendee fields are rejected.
- There is **no** customer route that sets `CANCELLED`. Cancellation and reschedule are requests only.
- Admin routes require an active `staff_members` row (`role = ADMIN`, `isSystem = false`). Disabled staff lose access immediately. Non-admin tokens receive 403.

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

## Admin lists (BE-050)

`GET /api/admin/bookings`, `/payments`, `/cancellation-requests`, `/reschedule-requests` return `CursorPage` (`items`, `nextCursor`, `totalCount`). See [admin-pagination.md](./admin-pagination.md).

## Uploads (BE-052)

Signed upload + confirm on coach photo and GCash QR. See [uploads.md](./uploads.md).

## Dashboard (BE-054)

`GET /api/admin/dashboard` and `/api/admin/dashboard/metrics` — operational scalars + 14-day Manila series. Not a substitute for `/api/admin/reports/*`. See [dashboard-metrics.md](./dashboard-metrics.md).

## Validation (BE-051)

Admin writes return **422** `ValidationFailed` (`fieldErrors` / `formErrors`). See [validation-contracts.md](./validation-contracts.md).
