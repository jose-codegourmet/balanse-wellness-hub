# Change: Session packages (#290)

## Why

Jose activated the backlog epic for reusable session packages (example: Newbie Package, 12 sessions, ₱0). Packages were listed as future scope; the updated issue is now the product contract.

## What

- Domain types and a mock redemption ledger on `MockDataAdapter`.
- Admin catalogue, customer/public package surfaces, grant-from-customer-detail, booking “Use a package,” waitlist intent + promotion revalidation.
- Docs: OpenSpec, screen specs, booking/payment/lifecycle rules, roadmap amendment.
- Backend Prisma/RLS/HTTP left as an explicit WIRE follow-up so the mock harness stays on.

## Decisions

- Customer copy says “package”; admin/code may say “bundle.”
- Remaining sessions are derived, never an unaudited counter.
- Package bookings still require studio confirmation (`PAYMENT_SUBMITTED` after a credit hold).
- Failed waitlist promotion keeps the customer waitlisted; no silent cash or alternate package.

## Validation

- `pnpm --filter @balanse/domain --filter @balanse/mock --filter web --filter admin typecheck`
- `pnpm --filter @balanse/domain --filter @balanse/mock --filter web --filter admin lint`
