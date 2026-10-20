# Delta: Catalogue and scheduling

Base: `openspec/specs/catalogue-and-scheduling.md` (requirements 1–n). Already merged into the base on 2026-10-20; kept here as the change history.

## MODIFIED Requirements

5. Admin creates, updates, publishes and cancels sessions from `/schedule/**`. **Each session carries two customer-change switches, `cancellable` and `reschedulable` (default on), deciding whether customers may open a cancellation or reschedule request for bookings on it; duplicate and recurrence copy them. They are admin capabilities for one-off events, not deadlines or price rules (canonical rules 42–51, 63–64); staff cancellation, studio cancellation and manual refunds are unaffected. Admin may turn a switch off after customers have booked; the form warns with the booking count.**
