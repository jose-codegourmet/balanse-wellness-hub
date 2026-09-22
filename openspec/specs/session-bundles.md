# Spec: Session bundles (packages)

## Requirements

1. A bundle (customer-facing **package**) is a reusable entitlement for a fixed number of eligible scheduled sessions. It is not a class, membership, wallet, gift card, coach package, or cash refund.
2. Admin can list, create, edit, publish, unpublish, and archive definitions at `/bundles`, `/bundles/new`, and `/bundles/[bundleId]`. Fields: name, unique slug, summary, rich-text description, session-credit count (>0), PHP price (zero allowed), all-active-classes or an explicit class set, optional validity days, optional per-customer limit, status `DRAFT` | `PUBLISHED` | `ARCHIVED`.
3. Only published definitions are customer-visible or claimable. Archive blocks new acquisition. Edits never rewrite existing entitlement snapshots.
4. Customers browse `/packages` and `/packages/[slug]`. Signed-in customers claim free packages or request paid ones. Paid entitlements activate only after admin approval. Acquisition is idempotent. Limits are enforced; admin grants from customer detail may override with an audit note.
5. Customers view owned packages at `/portal/packages` and `/portal/packages/[entitlementId]`, including remaining, held, used, restored, expiry, and redemption history. Copy says “sessions remaining,” never a monetary balance.
6. Booking shows “Use a package” only for entitlements eligible for that session’s class and start time. Multiple entitlements require an explicit choice. One credit is **held** with a main-list booking and **consumed** on confirm / check-in / completed / no-show. Rejection, hold expiry, and completed eligible cancellation restore exactly once.
7. Waitlisting never holds a credit. An intended package is revalidated on promotion. If it is exhausted, expired, revoked, or ineligible, the customer remains waitlisted with a clear action-required state. The studio never silently charges cash or picks another package.
8. Remaining sessions are derived from granted credits minus held and consumed redemptions. One booking has at most one non-restored redemption. History is append-only.
9. Mock-phase UI uses `getMockAdapter()` (admin through `apps/admin/src/lib/query/`). No UI `/api/*` or Supabase calls. `MockDataAdapter` mirrors the intended contracts. Backend Prisma, RLS, and HTTP handlers are a WIRE follow-up documented in `docs/backend/session-bundles.md`.

## Routes

- `/packages`, `/packages/[slug]`
- `/portal/packages`, `/portal/packages/[entitlementId]`
- `/bundles`, `/bundles/new`, `/bundles/[bundleId]`
- Planned HTTP (not wired): `GET /api/public/bundles`, `GET /api/me/entitlements`, `POST /api/bundles/{id}/claim`, `POST /api/admin/bundles`, `POST /api/admin/customers/{id}/bundles`
