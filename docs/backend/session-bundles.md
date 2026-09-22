# Session bundles / packages (BE-058 / #290)

Customer-facing name is **Package**. Admin/backend names use **bundle**. A bundle is a reusable session-credit entitlement for **one customer**. It is not a wallet, gift card, membership, subscription, or cash refund.

This phase ships **schema, HTTP contracts, transactional SQL, and MockDataAdapter parity**. Screens stay mock-first: no FE call to `/api/*` or Supabase. UI adapter methods keep FE names (`getPublicBundles`, `sessionCredits`); HTTP/Prisma use package paths and `sessionCreditCount`.

## Product invariants

- Remaining sessions = `snapshotSessionCreditCount − count(HELD + CONSUMED)`. Never trust an unaudited mutable counter.
- Historical snapshots on `customer_bundles` are immutable (trigger `entitlement_snapshot_immutable`).
- Editing or archiving a definition never rewrites issued entitlements or redemptions.
- Cash / GCash booking payments never become bundle credits. Restoring a redemption only returns that same session credit.
- One booking has at most one non-`RESTORED` redemption (partial unique index).
- Balances cannot go below zero; `hold_bundle_redemption` locks the entitlement row.
- Acquisition retries are idempotent via `bundle_acquisitions.idempotencyKey`.
- Waitlisting never holds or consumes a credit. An intended entitlement is revalidated on promotion.
- **Waitlist promotion block:** if the intended entitlement is exhausted, expired, revoked, ineligible, or foreign, the waiter stays `WAITING`, `promotionBlockReason` is set, and later FIFO rows may promote. The app never silently charges cash or picks another package.

## Models

| Table | Role |
| --- | --- |
| `bundles` | Definition: name, slug, credits, PHP price (0 allowed), applicability, optional validity days, optional per-customer limit, `DRAFT` / `PUBLISHED` / `ARCHIVED` |
| `bundle_class_applicability` | Explicit class set when mode is `EXPLICIT_CLASSES` |
| `bundle_acquisitions` | Claim / paid request / admin grant |
| `bundle_acquisition_payments` | Paid-acquisition payment only — **no booking FK** |
| `customer_bundles` | Issued entitlement + immutable snapshots |
| `bundle_redemptions` | Append-only HELD / CONSUMED / RESTORED ledger |
| `waitlist_entries.intendedEntitlementId` | Intent only |

Applicability is the **class on the scheduled session**, not the coach.

## Booking lifecycle

1. Main-list create with `entitlementId` → booking `HELD_AWAITING_PAYMENT` (existing admin confirmation) **and** redemption `HELD` in the same transaction.
2. Admin confirm / check-in / no-show → redemption `CONSUMED`.
3. Reject, hold expiry, or completed eligible cancellation → restore exactly once.
4. Open cancellation request does **not** restore.
5. Approved reschedule moves the same redemption to the target session after class/expiry revalidation (no second debit). Rejected reschedule leaves the original redemption.

Package bookings still use the 8-hour slot hold so unused reservations release **both** the slot and the credit.

## Concurrency

All debit/restore paths run in Postgres:

- `public.hold_bundle_redemption`
- `public.consume_bundle_redemption` (idempotent)
- `public.restore_bundle_redemption` (idempotent)
- `public.move_bundle_redemption`

`create_reservation` now accepts optional entitlement arguments. `expire_holds_and_promote_waitlist`, `transition_booking`, cancellation complete, and reschedule approve call the ledger functions.

## HTTP contracts

Public: `GET /api/public/packages`, `GET /api/public/packages/{slug}`.

Customer: owned list/detail/history, free claim, paid request + payment method/proof, eligible entitlements for a session. `POST /api/bookings` accepts `entitlementId`. Waitlist accepts `intendedEntitlementId`.

Admin: bundle CRUD + publish/unpublish/archive, grant/revoke, paid-acquisition approve/reject, redemption history.

422 bodies stay `ValidationFailed` (`fieldErrors` / `formErrors`).

## RLS / authz

Customers (`authenticated`) read published definitions and **their** acquisitions, entitlements, and redemptions. They may insert their own paid/claim acquisition rows. Staff (`is_admin()`) manage the catalogue, grants, revocations, and approvals. Prisma still bypasses RLS; handlers re-check the actor.

Cash refunds remain the existing manual refund workflow. Package payments never write `payments.bookingId`.

## Migration plan

Prisma SQL: `packages/db/prisma/migrations/20260922150000_be058_create_session_bundles/`.

**Do not apply to `xydundrayuusqizssgby` until reviewed.** The shared project is already behind other staged migrations (class catalogue, session coaches, recurrence). Reconcile `_prisma_migrations` and Supabase history first. This migration is additive (new enums/tables + function replacements). No live data rewrite.

## Mock fixtures

`packages/mock/src/bundle-fixtures.ts`:

- Newbie Package — 12 sessions, ₱0, published, all classes
- Yoga Eight — paid, published, Yoga only (kickboxing sessions are ineligible)
- Strength Starter — draft
- Ana — partially used Newbie (2 consumed, 1 held)
- Ben — exhausted one-credit Yoga entitlement
- Empty Inbox — expired Newbie
- Ana — pending paid Yoga Eight review
- Runtime: `failFinalCredit`, `emptyPackageCatalogue`, existing `sessionBecameFullId`
