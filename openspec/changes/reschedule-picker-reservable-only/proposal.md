# Change: Reschedule picker shows only requestable sessions (#379)

## Why

The customer reschedule picker queried the showcase calendar year (`SHOWCASE_SCHEDULE_RANGE`, 2026-01-01 → 2027-01-01) and rendered every published session, greying out ended, full, and past-cutoff ones with a "cannot request" note. A customer scrolled through weeks of dead rows before reaching the first session they could pick.

## What

- New `rescheduleRange(nowIso)` in `apps/web/src/modules/schedule/reschedule-range.ts`: the start of today in Asia/Manila through the start of the day eight weeks out, as UTC instants. The route page computes one `nowIso` per request and passes it to the form, so the server prefetch and the client query share one key.
- `RescheduleForm` keeps only sessions that are published, `reservable`, start after `nowIso`, and are not the booking's own session, grouped by day with the nearest first. The per-row disabled rendering and the `unavailableReason` helper are gone; the legend reads "Ended, full, and past-cutoff sessions are not listed." The empty state says nothing is requestable in the next eight weeks and keeps the slot held.
- The server-side `target_session_full` / cutoff error handling is unchanged, so a session that fills between load and submit still returns the field error.
- Stories: Default and Mobile on the fixture clock (`MOCK_NOW_ISO`), and Empty with a clock after the last fixture session.
- Screen spec `docs/screen-specs/customer/13-reschedule-request.md` rewritten around the picker rules.

## Decisions

- `PublicSession.reservable` and `availability` are the single source of "cannot request"; the client does not re-derive cutoff or capacity. The extra start-time check only guards a page left open across a session start.
- No same-class or price-difference filtering (canonical rules 51 and 64; OQ-2 stays open). `booking-lifecycle.md` requirement 6 is unchanged: listing only requestable sessions is a presentation rule, not a new business rule.
- The legacy `apps/web/src/modules/customer/RescheduleRequest.tsx` (story-only, superseded by the route form) is left as is; its cleanup is a separate task.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`.
- Storybook review of the Default, Mobile, and Empty stories at 360 / 768 / 1280.
