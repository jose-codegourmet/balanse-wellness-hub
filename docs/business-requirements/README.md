# Balanse — MVP Business Documentation

This folder is the business-level source of truth for the first Balanse booking MVP.

It is intentionally focused on **business behavior, user flows, operational rules, states, and scope**. It is not a technical implementation specification.

## Product in one sentence

Balanse is a calendar-first class booking system for a wellness gym where customers can see class availability, reserve sessions, pay through GCash or at the counter, and have bookings manually confirmed by the gym admin.

## Confirmed MVP principles

1. The calendar is the main customer-facing entry point.
2. Every booking, including physical walk-ins, must go through the system.
3. Customers must have their own account to reserve.
4. Customers cannot book for another person.
5. Classes are priced per session.
6. Payments are manual in MVP.
7. Supported MVP payment paths:
   - GCash with uploaded proof of payment.
   - Cash / Pay at Counter.
8. Reservations temporarily hold capacity while payment/approval is pending.
9. The default reservation grace period is 8 hours, capped by the class start time.
10. The grace period is developer-configurable, not admin-configurable.
11. New bookings and waitlist promotions stop at a developer-configurable cutoff before class; default is 15 minutes.
12. Waitlist ordering is FIFO.
13. Admin has final confirmation authority.
14. Cancellation is a request, not an instant customer-side cancellation.
15. Refunds are manual. No store credit in MVP.
16. No-shows do not receive refunds.
17. Coach schedules are managed by admin, not by coaches.
18. Check-in is performed manually by admin.
19. Waivers and policies must be accepted during booking, and the accepted version must be recorded.
20. Recurring schedule automation is future scope, not MVP.

## Document index

- `01-product-context.md` — business background, problem, goals, operating model
- `02-mvp-scope.md` — included vs excluded MVP capability
- `03-roles-and-permissions.md` — guest, customer, admin, coach boundaries
- `04-auth-and-profile.md` — account and identity rules
- `05-class-and-schedule-rules.md` — classes, sessions, schedules, capacity
- `06-booking-rules.md` — canonical reservation rules
- `07-booking-form-and-waivers.md` — booking form, policy acceptance, identity binding
- `08-payment-rules.md` — GCash, cash, payment evidence, manual verification
- `09-reservation-lifecycle.md` — statuses and transitions
- `10-capacity-and-waitlist.md` — slot holds, FIFO waitlist, promotion rules
- `11-cancellations-and-refunds.md` — customer/admin cancellation behavior
- `12-rescheduling.md` — current confirmed behavior and remaining decisions
- `13-check-in-attendance-and-no-show.md` — arrival, attendance, no-show handling
- `14-customer-flows.md` — guest, customer, walk-in, payment, cancellation flows
- `15-admin-flows.md` — day-to-day admin workflows
- `16-edge-cases.md` — expected exceptions and system responses
- `17-developer-config.md` — business settings intentionally controlled by developer
- `18-notifications-and-confirmations.md` — in-app confirmation and optional email
- `19-future-scope.md` — explicit post-MVP ideas
- `20-open-questions.md` — unresolved business decisions
- `21-canonical-rules.md` — concise canonical rule set for implementation agents

## Status labels used in these docs

- **CONFIRMED** — explicitly agreed with the client/project owner.
- **MVP DEFAULT** — agreed initial behavior that may later be configurable.
- **FUTURE** — intentionally excluded from MVP.
- **OPEN** — business decision still required.

When two documents appear to conflict, `21-canonical-rules.md` should be treated as the highest-level business reference, then the more specific rule document.
