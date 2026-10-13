# Tasks: No new events on started sessions

Status: implemented in the working tree on 2026-10-13, not yet committed.

- [x] `postAdminEvent` 409 `event_on_started_session` with `details.startsAt`.
- [x] `event_on_started_session` in `EVENT_CONFLICT_CODES` / `EVENT_CONFLICT_MESSAGES`.
- [x] `EventFormPage` `liveBlock`, `EventSessionPicker` `blocked: "started"` (+ meta).
- [x] `SelectedSessionPanel` `showEvent` gate.
- [x] `docs/backend/session-events.md`, `docs/backend/api-routes.md` events paragraph.
- [ ] Decide whether `app_private.assert_session_event_invariants` should also raise `event_on_started_session` on insert (currently API-only; the doc says the API enforces it).
- [ ] `docs/screen-specs/admin/18-event-management.md`: started-session rule.

## Files in this change

Shared files (also touched by other changes; split with `git add -p`): `apps/admin/src/app/(dashboard)/schedule/_components/selected-session-panel/SelectedSessionPanel.tsx` (`started` / `showEvent` lines only), `packages/domain/src/contracts.ts` (`EVENT_CONFLICT_*`), `docs/backend/api-routes.md` (events paragraph).

- `apps/admin/src/app/(dashboard)/schedule/_components/event-form-page/EventFormPage.tsx`
- `apps/admin/src/app/(dashboard)/schedule/_components/event-form-page/event-session-picker/*`
- `packages/api/src/handlers/admin-events.ts`
- `docs/backend/session-events.md`
