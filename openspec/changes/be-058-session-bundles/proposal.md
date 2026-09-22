# Change — BE-058 session bundles

## Why

Issue #290 (activated): customers need reusable session packages such as Newbie Package (12 sessions, ₱0) without introducing wallets, memberships, or cash-to-credit refunds.

## What this change owns

Backend/contract half only:

- Prisma models, RLS, transactional hold/consume/restore
- Domain types in `@balanse/domain`
- HTTP inventory + handlers (mounted, not wired from screens)
- MockDataAdapter + deterministic fixtures
- Docs: roadmap, BR 06/08/09/19, backend, screen-spec stubs, OpenSpec

## Out of scope

FE admin/customer screens, subscriptions, memberships, wallets/gifting, coach-specific or unlimited packages, partial credits, auto gateway/refunds, auto Newbie enrollment, applying the migration to the live shared database without review.
