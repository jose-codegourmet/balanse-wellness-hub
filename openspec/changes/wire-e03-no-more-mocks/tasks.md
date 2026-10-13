# Tasks: WIRE-E03 — OpenSpec and query layer reflect the wired runtime

Status: implemented in the working tree on 2026-10-13, not yet committed. Unchecked items are follow-ups.

- [x] New base specs (8) and `openspec/README.md`.
- [x] Reworded `events`, `fe-admin-screens`, `fe-customer-screens`, `fe-foundation`, `fe-public-screens`, `fe-shared-systems`, `recurring-schedules`, `session-bundles`, `venues`.
- [x] `prefetchAdmin` → `HydrationBoundary`; `mock-hydration-boundary.tsx` removed; `docs/ways-of-working.md` note.
- [x] `ConfirmAction` story reference.
- [ ] Replace web's `MockHydrationBoundary` with the same plain hydration once the web query README is updated.
- [ ] Archive the finished FE wave changes under `openspec/changes/` (or move them to an `archive/` folder) and merge any leftover deltas.
- [ ] Mark `openspec/changes/session-bundles/proposal.md` and `recurring-schedules/proposal.md` as wired (their "What" still says backend is a WIRE follow-up / unwired).
- [ ] `AGENTS.md` read order: point at `openspec/README.md` first.

## Files in this change

- `openspec/README.md`
- `openspec/specs/booking-lifecycle.md`, `catalogue-and-scheduling.md`, `identity-and-onboarding.md`, `payments-and-refunds.md`, `platform-and-data.md`, `policies-and-content.md`, `public-sharing-and-roster.md`, `reporting-and-operations.md`
- `openspec/specs/events.md`, `fe-admin-screens.md` (all but req 21), `fe-customer-screens.md`, `fe-foundation.md`, `fe-public-screens.md` (reqs 6 and 8), `fe-shared-systems.md`, `recurring-schedules.md`, `session-bundles.md`, `venues.md`
- `apps/admin/src/lib/query/prefetch.tsx`, `apps/admin/src/lib/query/mock-hydration-boundary.tsx` (deleted)
- `docs/ways-of-working.md`
- `apps/admin/src/components/balanse/confirm-action/ConfirmAction.stories.tsx`
