# Delta: Catalogue and scheduling

Base: `openspec/specs/catalogue-and-scheduling.md`. Requirements 6 and 8 already describe this change in the base; they are repeated here so the change can be archived cleanly.

## ADDED Requirements (already merged as base 6 and 8)

6. The schedule uses `Asia/Manila` for calendar days, including sessions crossing midnight. A session can span two date views; the second day exposes only the after-midnight continuation and opens the same occurrence.
8. A future, non-cancelled occurrence can be moved on its start day by authorized staff in 15-minute steps. Review shows the old and new time, affected bookings/waitlist where permitted, and coach or venue overlaps. The write rechecks the original time under a lock (`expectedStartsAt` / `expectedEndsAt` → 409 `session_time_changed`), preserves duration and bookings, and changes one recurrence occurrence only. Started sessions (409 `session_move_locked`) and destinations in the past (409 `session_move_in_past`) are rejected.
