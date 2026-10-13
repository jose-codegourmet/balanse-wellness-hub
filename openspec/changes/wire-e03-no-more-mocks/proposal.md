# Change: WIRE-E03 — OpenSpec and query layer reflect the wired runtime (#376 / #377)

## Why

The capability specs still said screens read `getMockAdapter()` and "do not fetch `/api/*`", and several listed HTTP routes as "implemented, not wired". Since the WIRE epic the runtime reads typed `@balanse/api-client` functions through React Query, with the mock adapter confined to Storybook. Agents following the read order in `AGENTS.md` were being pointed at a mock-phase contract. Admin server prefetch also still used the mock-era `MockHydrationBoundary`, which skipped any query the browser already held, so a soft navigation after a write kept stale rows on screen.

## What

- **Capability specs.** Eight new base specs organised by capability rather than by screen wave: `booking-lifecycle`, `catalogue-and-scheduling`, `identity-and-onboarding`, `payments-and-refunds`, `platform-and-data`, `policies-and-content`, `public-sharing-and-roster`, `reporting-and-operations`. Each has requirements, scenarios and a surfaces/sources section.
- **Feature map.** `openspec/README.md` maps customer, studio and cross-cutting features to specs, routes and API families, and lists the active change areas.
- **Reworded base specs.** `events`, `fe-admin-screens` (1, 7, 9, 10, 11, 12, 13), `fe-customer-screens`, `fe-foundation` (6), `fe-public-screens` (6, 8), `fe-shared-systems` (1–3), `recurring-schedules` (10), `session-bundles` (9), `venues` (1, 4, 7) now describe the typed API runtime with Storybook on fixtures, and route lists drop "implemented, not wired". Nav specs follow `ADMIN_NAV_ITEMS` / `CUSTOMER_NAV_ITEMS` (Packages, Marketing insights) instead of fixed counts.
- **Admin hydration.** `prefetchAdmin` hydrates with a plain `HydrationBoundary` so a newer server read replaces the browser cache; `apps/admin/src/lib/query/mock-hydration-boundary.tsx` is deleted. `docs/ways-of-working.md` records that web still uses `MockHydrationBoundary`.
- Housekeeping: the `ConfirmAction` story uses a real `BWH-…` reference.

## Decisions (Jose, 2026-10-13)

- Base specs describe current behaviour; `changes/` keeps proposal history. A base edit does not erase an in-flight change's delta.
- Business policy stays in `docs/business-requirements/`; the new specs link to it rather than restate open questions (cancellation deadline, reschedule pricing, waiver text, OQ-10).
- Screen-wave specs (`fe-*`) are kept and reworded rather than deleted, because screen specs and metas still cite them.

## Out of scope

Archiving the older FE wave changes (`fe-fnd-foundation`, `fe-shr-shared-systems`, `fe-pub-public-screens`, `fe-cus-customer-screens`, `fe-adm-admin-polish`, `be-058-session-bundles`), replacing web's `MockHydrationBoundary`, and removing `@balanse/mock` runtime knobs.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`
- Manual: on admin, save a class and soft-navigate back to `/classes`; the new row is present without a hard reload.
