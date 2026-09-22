# Session bundles — backend follow-up

Mock-first delivery for #290. UI and `MockDataAdapter` implement the product rules. Do **not** wire screens to `/api/*` until a dedicated WIRE ticket.

## Proposed models

Equivalent Prisma concepts (names may differ):

- `Bundle` — definition (name, slug, summary, description, sessionCredits, pricePhp, applicability, validityDays, perCustomerLimit, status, timestamps)
- `BundleClass` — explicit class applicability
- `BundleAcquisition` — claim / paid request / admin grant (idempotency key, channel, status, override)
- `CustomerBundle` / entitlement — snapshot of terms at acquisition
- `BundleRedemption` — append-only hold / consume / restore against one booking + session
- `BundleAuditEvent` — actor, action, customer, entitlement, booking/session, reason, timestamp
- Paid acquisition payment row that is **not** a fake booking payment

## Invariants

- One entitlement belongs to one customer and one originating bundle.
- One booking has at most one non-restored redemption.
- Balances never go below zero; debit/restore is transactional in Postgres.
- Historical snapshots are immutable when a definition changes.
- Customer A cannot read or spend customer B’s entitlement.
- Cash refunds never become package credits.

## Planned routes

See `packages/db/contracts/routes.ts` ticket `BE-058`. OpenAPI lists the paths; HTTP handlers are not implemented.

## Waitlist promotion

If the intended entitlement cannot be reserved, the customer **remains waitlisted** with `packagePromotionBlocked`. Staff must contact them. Do not auto-charge cash or choose another package.
