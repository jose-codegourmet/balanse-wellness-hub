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

- memberships
- monthly plans
- class passes as a separate product from session packages
- monetary credits / wallet

Session packages (fixed session entitlements, including a free Newbie Package) are delivered as mock-first catalogue + ledger behavior. See `openspec/specs/session-bundles.md` and GitHub #290. Remaining backend WIRE (Prisma, RLS, HTTP handlers) is a follow-up.
- promo codes
- loyalty

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
