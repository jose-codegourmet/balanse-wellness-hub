# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md`. Requirement 21 already describes this change in the base; it is repeated here so the change can be archived cleanly.

## ADDED Requirements (already merged as base 21)

21. The schedule sidebar shows a selected-day hourly timeline in Philippine time, with overlapping sessions in separate lanes and a live current-time line for today. A session crossing midnight appears on both calendar dates; the next day shows and labels only its after-midnight portion. Clicking that continuation opens the next day's details. Clicking a session opens its details over the timeline; Back to day restores the scroll position, and previous/next navigate the day's sessions. Staff with `schedule.update` can move future, non-cancelled sessions to another start time on their start day using a drag grip or keyboard arrows in 15-minute steps; continuation segments have no move grip. A review shows old/new times, affected booked places and waitlist count where roster access permits, and coach/venue overlaps before saving. Moves preserve duration and bookings, including when the end falls on the next day, and affect only one recurrence occurrence. Started sessions and destinations in the past are blocked; the API checks the original window under the session lock to reject stale moves.
