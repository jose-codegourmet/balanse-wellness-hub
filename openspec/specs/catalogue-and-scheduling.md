# Spec: Catalogue and scheduling

## Requirements

1. A class is a reusable catalogue item. A scheduled `GymSession` is the bookable occurrence and owns its date, time, capacity, customer price, venue, publication status, and coach assignments. Publishing a class does not create a session.
2. Public class and coach reads expose active marketing information only. The class detail may show its public teaching roster and upcoming sessions. `ClassMarketingCoach` never substitutes for `SessionCoach`: every session has at least one active assigned coach, and a session may have multiple coaches.
3. Admin can create, edit, publish or retire catalogue entries from `/classes/**` and `/coaches/**`. Class copy, cover, gallery and teaching roster are managed separately from the scheduled session. A coach's internal default rate and rate type are available only on authorized admin surfaces.
4. Creating a session captures its customer price and each assigned coach's compensation as historical snapshots. Later changes to a class price or coach default rate do not rewrite existing bookings, session cost or reports. A duration-based coach cost uses the scheduled duration. A session's customer price (and a class default price) is at least ₱1; once any customer has paid or submitted payment for the session, its price is locked and the editor shows why.
5. Admin can create, update, publish and cancel individual sessions from `/schedule/**`. Only published future sessions are offered for customer booking; capacity and cutoff remain governed by [booking lifecycle](booking-lifecycle.md). A cancelled session retains its booking and refund history. Each session carries two customer-change switches, `cancellable` and `reschedulable` (default on), which decide whether customers may open a cancellation or reschedule request for bookings on it; duplicate and recurrence copy them. They are admin capabilities for one-off events, not deadlines or price rules, and staff cancellation, studio cancellation and manual refunds are unaffected. Admin may turn a switch off after customers have booked; the form warns with the booking count.
6. The schedule uses `Asia/Manila` for calendar days, including sessions crossing midnight. A session can span two date views; the second day exposes only the after-midnight continuation and opens the same occurrence.
7. Staff with a linked coach profile can scope the schedule to their assigned sessions. The built-in Coach role is restricted to that scope. Other staff see only the schedule scope their permissions allow.
8. A future, non-cancelled occurrence can be moved on its start day by authorized staff in 15-minute steps. Review shows the old and new time, affected bookings/waitlist where permitted, and coach or venue overlaps. The write rechecks the original time under a lock, preserves duration and bookings, and changes one recurrence occurrence only. Started sessions and destinations in the past are rejected.
9. Coach or venue overlaps are advisory; they do not silently rewrite another session. Venue ownership, active selection and event inheritance are defined in [venues](venues.md) and [events](events.md). Bounded generation is defined in [recurring schedules](recurring-schedules.md).
10. An assigned coach who lacks direct cancellation authority can request a reschedule, substitute or cancellation for an upcoming class, with a reason. Only one request is pending per session. The coach may withdraw it; an authorized reviewer may approve or deny with a note and cannot review their own request. Approval requires the underlying schedule permission and applies the actual change; a request alone leaves the session unchanged.

## Scenarios

- **Historical cost:** Given a published session with a coach-rate snapshot, when the coach's default rate changes, the old session and its reports keep the captured rate.
- **Locked price:** Given a session with a confirmed or payment-submitted booking, when admin edits the session, the price field is read-only and the API rejects a different price (`price_locked`); other fields still save.
- **Zero price:** Given a new or unpaid session, when admin enters ₱0, the form and the API reject it (minimum ₱1).
- **Stale move:** Given a move review for a future session, when another actor changes the original time before save, the move is rejected instead of shifting the new time onto the changed occurrence.
- **Coach request:** Given an assigned coach without `schedule.cancel`, when they request cancellation, the session stays scheduled until an authorized reviewer approves.

## Surfaces and sources

- Public: `/classes`, `/classes/[slug]`, `/coaches`, `/book/quick`, `/book/calendar`; `GET /api/public/classes|coaches|sessions`.
- Admin: `/classes/**`, `/coaches/**`, `/schedule/**`, `/schedule/requests`; `/api/admin/classes`, `/coaches`, `/sessions`, `/class-change-requests`.
- Detail: `docs/business-requirements/05-class-and-schedule-rules.md`, `docs/backend/class-catalogue.md`, `docs/backend/session-coach-assignments.md`, `docs/backend/class-change-requests.md`.
