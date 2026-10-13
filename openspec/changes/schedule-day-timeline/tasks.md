# Tasks: Schedule day timeline, overnight sessions and reviewed session moves

Status: implemented in the working tree on 2026-10-13, not yet committed. Base specs already carry the behaviour (`fe-admin-screens` 21, `catalogue-and-scheduling` 6 and 8). Unchecked items are follow-ups.

## BE

- [x] `patchAdminSession`: `expectedStartsAt` / `expectedEndsAt` check under `FOR UPDATE`; `session_time_changed`, `session_move_locked`, `session_move_in_past`.
- [x] `generate-openapi.ts` documents the optional `expected*` fields on PATCH; OpenAPI regenerated.
- [ ] `docs/backend/api-routes.md` sessions paragraph: the three 409 codes and the optimistic-concurrency fields.

## FE

- [x] `@balanse/domain`: `sessionOverlapsManilaDay`, `formatSessionTimeRange` "+1 day".
- [x] `session-form.schema.ts`: `addMinutesToSessionIso`; `SessionFormPage` uses it and shows "the next day".
- [x] `DaySessionTimeline` (+ meta, stories), `SessionMoveReview` (+ meta, stories), `SelectedSessionPanel` overlay (+ new stories), `ScheduleListPage` day/session selection, `AdminScheduleCalendar` continuation chips and `(session, ymd)` callback (+ `OvernightContinuation` story).
- [x] `useMoveAdminSession`; `patchSession` accepts the `expected*` fields.
- [ ] `docs/screen-specs/admin/05-schedule-management.md`: timeline, continuation and move review.
- [ ] Customer calendar: decide whether `BalanseBookingCalendar` should also show overnight continuations (today it keys sessions by start day).

## Files in this change

Shared files (also touched by other changes; split with `git add -p`): `packages/api/src/handlers/admin-catalogue.ts` (`patchAdminSession` only), `packages/db/contracts/openapi.json`, `apps/admin/src/app/(dashboard)/schedule/_components/selected-session-panel/SelectedSessionPanel.tsx` (the `showEvent` lines belong to `event-started-session-guard`), `openspec/specs/fe-admin-screens.md` (req 21).

- `apps/admin/src/app/(dashboard)/schedule/_components/day-session-timeline/**`, `session-move-review/**`
- `apps/admin/src/app/(dashboard)/schedule/_components/selected-session-panel/SelectedSessionPanel.meta.ts`, `SelectedSessionPanel.stories.tsx`
- `apps/admin/src/app/(dashboard)/schedule/_components/schedule-list-page/*`
- `apps/admin/src/app/(dashboard)/schedule/_components/session-form-page/SessionFormPage.tsx`
- `apps/admin/src/components/balanse/schedule-calendar/*`
- `apps/admin/src/modules/admin/forms/session/session-form.schema.ts`
- `apps/admin/src/lib/query/mutations/sessions.ts`
- `packages/api-client/src/sessions.ts`
- `packages/domain/src/calendar-layout.ts`, `format.ts`
- `packages/db/scripts/generate-openapi.ts`
