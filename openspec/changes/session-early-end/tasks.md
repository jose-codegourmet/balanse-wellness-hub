# Tasks: Coach ends a session early

## BE

- [ ] `GymSession`: `endedAt DateTime? @db.Timestamptz`, `endedByStaffId String?` + `StaffMember` relation (`onDelete: SetNull`) on both sides, `@@index([endedByStaffId])`. Forward-only migration in `packages/db` and `supabase/migrations`.
- [ ] RLS: no direct client writes to the new columns; writes only through the API.
- [ ] `POST /api/admin/sessions/{id}/end` — `requireOwnedSession(…, "attendance.manage.own", "attendance.manage.all")`; 409 `session_not_in_progress` unless `PUBLISHED`, `startsAt ≤ now < endsAt` and `endedAt IS NULL`; 409 `attendance_unresolved` with `{ bookingIds }` while any `CONFIRMED` booking remains; sets `endedAt = now`, `endedByStaffId`; audit `session.ended`.
- [ ] `POST /api/admin/sessions/{id}/reopen` — same permission; 409 unless `endedAt` set and `now < endsAt`; clears both columns; audit `session.reopened`.
- [ ] Present `endedAt` / `endedByStaffName` on the admin session DTO and roster response.
- [ ] Share/poster routes: past when `min(endedAt, endsAt) ≤ now`.
- [ ] `docs/backend/api-routes.md`, `docs/backend/enum-vocabulary.md` note (COMPLETED still unused).

## FE

- [ ] `@balanse/domain`: `endedAt`, `endedByStaffName` on the admin session type; `sessionPhase(session, now)` → `upcoming | in_progress | ended_early | past | cancelled`.
- [ ] `@balanse/api-client`: `endSession`, `reopenSession`; `ApiError` code `attendance_unresolved`.
- [ ] Roster: **End session** button in the header (in progress only) → confirm dialog listing unresolved guests with inline Check in / No-show; End is disabled until the list is empty. Ended banner "Ended early at <time> by <name>" + **Reopen** (until `endsAt`). Update `RosterPage.meta.ts` and stories (in progress, blocked, ended).
- [ ] Schedule selected-session panel: "In progress" / "Ended early · <time>" badge.
- [ ] `MockDataAdapter` + fixtures: an in-progress session with one unresolved guest, an ended-early session.
- [ ] Screen spec `docs/screen-specs/admin/12-session-roster-check-in.md`.
