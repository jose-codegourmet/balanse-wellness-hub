# 19 — Future Scope

These items are intentionally not required for the first proof-of-concept MVP.

## Payments

- PayMongo
- Maya
- Stripe
- automated payment verification
- automated refunds
- payment webhooks
- downloadable/payment gateway receipts

## Scheduling

- recurrence exceptions / holiday rules
- series-wide recurrence editing and deletion
- coach self-service availability
- coach portal

## Customer commercial features

Delivered in BE-058 (not future scope): **session packages / bundles** — fixed session credits for one customer (example: Newbie Package, 12 sessions, ₱0). Ledger-derived remaining sessions, admin catalogue, free claim, paid manual review, grant/revoke. See `docs/backend/session-bundles.md` and issue #290.

Still future scope:

- memberships
- monthly plans
- class passes as a separate product from session packages
- monetary credits / wallet
- wallet / gift cards / transferable store credit

Session packages (fixed session entitlements, including a free Newbie Package) are delivered as mock screens plus BE-058 contracts. See `openspec/specs/session-bundles.md` and GitHub #290. Screens do not call `/api/*` in this phase.
- promo codes
- loyalty
- gifting or shared/family packages
- coach-specific or unlimited packages
- partial credits
- automatic Newbie Package enrollment

## Notifications

- Resend email notifications
- automated reminders
- waitlist-promotion notifications
- cancellation/refund emails
- SMS/push notifications

## Operations

- advanced attendance reporting
- no-show analytics
- coach performance analytics
- revenue dashboards
- automated staff permissions
- multiple branches

## Configuration

- admin-editable grace period
- admin-editable booking cutoff
- more granular cancellation policy engine

The MVP should not be delayed to implement these unless a newly discovered business dependency makes one essential.

## Reporting scope clarification

Basic operational sales, coach-cost, and capacity-utilization reporting is now considered part of the MVP.

Still future scope:

- advanced BI dashboards,
- forecasting,
- formal accounting statements,
- tax reporting,
- payroll,
- accounting-software integrations.
