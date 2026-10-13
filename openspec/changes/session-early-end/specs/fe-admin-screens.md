# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md` (requirements 1–20). Merge on archive; renumber if the base has grown.

## ADDED Requirements

21. Ending a session early. On the session roster (`/sessions/[sessionId]/roster`), staff with `attendance.manage.own` for an assigned session, or `attendance.manage.all`, see **End session** while the session is `PUBLISHED`, in progress (`startsAt ≤ now < endsAt`) and not yet ended. The confirm dialog lists every `CONFIRMED` guest not yet checked in or marked no-show, with inline Check in / No-show; **End session** stays disabled until that list is empty. Held and waitlisted guests do not block ending. Ending records `endedAt` and the ending staff member; the scheduled `startsAt` / `endsAt` are unchanged, coach cost still uses the scheduled duration, and no booking moves to `COMPLETED` (OQ-10).
22. An ended session shows "Ended early at <time> by <name>" on the roster and "Ended early · <time>" in the schedule selected-session panel; an in-progress, not-ended session shows "In progress". The same staff can **Reopen** until the scheduled `endsAt`; after that the session is simply past. Attendance actions on the roster are unchanged by ending or reopening.
