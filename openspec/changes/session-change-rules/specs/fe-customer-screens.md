# Delta: FE customer screens

Base: `openspec/specs/fe-customer-screens.md`. Already merged into the base on 2026-10-20; kept here as the change history.

## ADDED Requirements

- Per-session change rules: the public session and event pages, the calendar's selected-session panel, and the booking form show “No cancellations” / “No reschedules” when a session refuses those requests. The booking form then requires an “I understand this reservation cannot be cancelled / rescheduled.” checkbox before reserving or joining the waitlist. Booking detail hides the refused request action and explains why; `/cancel` and `/reschedule` render that notice with Back to booking instead of the form.
