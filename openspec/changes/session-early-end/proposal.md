# Change: Coach ends a session early ("Done")

## Why

Classes sometimes finish before their scheduled end (e.g. 30 minutes early). Today a session has no "ended" state: `SessionStatus` is `DRAFT | PUBLISHED | CANCELLED`, and "over" is only ever inferred from the clock passing `endsAt`. The coach has no way to say "we're done", the roster keeps looking live, and nothing makes sure attendance is finished before the coach walks away.

## What

- `GymSession` gains `endedAt` (nullable) and `endedByStaffId` (nullable, `StaffMember`). The scheduled `startsAt` / `endsAt` are never rewritten.
- The session roster (`/sessions/[sessionId]/roster`) shows **End session** while the session is in progress (`startsAt ≤ now < endsAt`, `PUBLISHED`, not yet ended).
- Ending requires every `CONFIRMED` main-list booking to be resolved first (checked in or marked no-show). The confirm dialog lists the unresolved guests and blocks ending until the list is empty.
- An ended session reads as finished everywhere: roster and schedule panel show "Ended early · <time>", and the share/poster routes treat it as past. The effective end is `min(endedAt, endsAt)`.
- **Reopen** is available to whoever can end it, until the scheduled `endsAt`, for mis-taps. After `endsAt` the session is simply past.
- `POST /api/admin/sessions/{id}/end` and `POST /api/admin/sessions/{id}/reopen`, both audited (`session.ended`, `session.reopened`).

## Decisions (Jose, 2026-10-13)

- **Coach pay uses scheduled time.** `sessionCoachCost` keeps `endsAt − startsAt`; ending early never reduces a `PER_HOUR` payout.
- **Unmarked guests must be resolved first.** No automatic no-show, because no-show has refund / package-credit side effects.
- **OQ-10 stays open.** Ending a session does not move bookings to `COMPLETED`; `CHECKED_IN` remains the attended state and the DB guard `completed_blocked_oq10` is untouched.
- **Permission:** reuse `attendance.manage.own` (assigned coach) / `attendance.manage.all` (admins) via `requireOwnedSession`. No new permission key.
- Booking and waitlist are unaffected: sessions already stop accepting bookings at `startsAt` (`sessionAvailability` → `past`).
- Held / waitlisted bookings do not block ending; their existing expiry jobs handle them.

## Out of scope

Booking `COMPLETED` transition (OQ-10), actual-duration payroll, customer notifications on early end, ending a session before its `startsAt`, bulk "mark the rest no-show".

## Validation

- Prisma validate/generate and a clean forward-only migration
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`
- Manual QA as Coach (own session / other coach's session denied) and Admin: end blocked with unmarked guests, end after resolving, reopen before `endsAt`, reopen hidden after `endsAt`
