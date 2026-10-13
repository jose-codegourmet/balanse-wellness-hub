# Change: Schedule day timeline, overnight sessions and reviewed session moves

## Why

The `/schedule` day sidebar was a flat list that auto-selected the first session, hid sessions that cross midnight from the second day, and offered no way to shift a session's time without opening the full form. A session that ran past midnight was also laid out wrong in the composer (`addMinutesHhmm` wrapped the clock without rolling the date).

## What

- **Day timeline.** The sidebar (`SelectedSessionPanel`) now shows an hourly Manila-time timeline (`DaySessionTimeline`): overlapping sessions in separate lanes, a live current-time line for today, and a session click that opens details in an overlay. **Back to day** restores the scroll position and focus; previous/next step through the day's sessions. Opening a day no longer auto-selects a session.
- **Overnight sessions.** A session appears on every Manila day it overlaps (`sessionOverlapsManilaDay`). The next day shows only the after-midnight portion, labelled "Continues · <name>" and "12:00 AM" on calendar chips and "Continues from previous day" on the timeline; clicking the continuation opens that day's panel on the same occurrence, whose details say "Started <date>". `formatSessionTimeRange` appends "(+1 day)" when the end is on a later date; the composer uses `addMinutesToSessionIso` so an 11:45 PM start plus 4 hours ends at 3:45 AM the next day and the duration hint says "the next day".
- **Reviewed moves.** Staff with `schedule.update` can drag a session's grip, or use arrow keys in 15-minute steps and Enter, to pick a new start time on the session's start day. `SessionMoveReview` shows old and new times, affected booked places and waitlist count where roster access permits, and coach/venue overlaps (advisory) before saving. Only future, non-cancelled sessions can move; continuation segments have no grip. Saving sends `startsAt` / `endsAt` with `expectedStartsAt` / `expectedEndsAt` (`useMoveAdminSession`); duration and bookings are preserved and a recurring move affects one occurrence.
- **API guards.** `PATCH /api/admin/sessions/{id}` rejects a move whose `expected*` no longer match under the session lock (409 `session_time_changed`), a move of a started or cancelled session (409 `session_move_locked`), and a destination in the past (409 `session_move_in_past`). OpenAPI documents the two optional fields.
- `AdminScheduleCalendar.onOpenSession(session, ymd)` reports the displayed day so continuations open the right panel; new `OvernightContinuation` and panel stories cover the states.

## Decisions (Jose, 2026-10-13)

- Moves change time only. Coach, venue, capacity, price and rate snapshots are never resubmitted by a move.
- Overlaps stay advisory (venue sharing is the studio's call); only the review surfaces them.
- A move is rejected rather than merged when someone else changed the session first.
- Moving a recurring occurrence does not edit the rule; series-wide editing remains out of scope (`recurring-schedules.md` req 9).

## Out of scope

Resizing (changing duration) on the timeline, moving to another day by drag, week-view drag, and customer notifications on a move.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`
- Manual: open a day with overlapping sessions; create an 11:45 PM session with a 4-hour duration and confirm it shows on both days; drag a future session, review, save; attempt to move a started session (grip absent) and a stale session (second tab changes it first → 409 toast). Keyboard: Tab to a grip, Arrow ×2, Enter, Escape.
