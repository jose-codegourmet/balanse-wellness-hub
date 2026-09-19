# 21 — Canonical Rules

This file is the concise business source of truth for implementation agents.

## Product

1. Balanse is a calendar-first wellness gym class booking system.
2. The MVP exists to validate centralized digital booking and schedule transparency.
3. All bookings, including physical walk-ins, must go through the system.

## Identity

4. Guests may browse availability.
5. Authentication is required to reserve.
6. Preferred auth is Supabase Auth with Google sign-in, with email/password support as needed.
7. A customer books only for themselves.
8. The authenticated account owner is the attendee.
9. Known personal details should be reused from the customer profile.

## Booking form

10. Each reservation uses a booking form.
11. Required waivers/policies must be affirmatively accepted.
12. The accepted policy/document version and timestamp should be recorded.
13. Coach Rex must supply the production waiver/policy content.

## Classes and pricing

14. Classes are represented by scheduled sessions.
15. Pricing is per session.
16. Session duration may vary; a session can be around 1–3 hours.
17. A customer may book multiple sessions on the same day.
18. Each session has finite capacity.

## Schedule management

19. Admin manages schedules and coach assignments.
20. Coaches do not edit their own schedules in MVP.
21. Recurring schedule automation is future scope.

## Payment

22. MVP payments are manual.
23. Supported methods are GCash and Pay at Counter/Cash.
24. GCash requires uploaded proof of payment.
25. Cash requires admin to record receipt of cash; no screenshot is required.
26. Payment does not automatically confirm the booking; admin has final confirmation authority.
27. No PayMongo/Maya/Stripe payment gateway is required in MVP.

## Reservation hold

28. A main-list reservation temporarily consumes capacity.
29. Default hold duration is 8 hours.
30. Effective hold expiry cannot be later than class start.
31. Hold duration is developer-configurable, not Rex/admin-configurable in MVP.

## Booking cutoff

32. Stop creating new bookings too close to class start.
33. Default cutoff is 15 minutes before class.
34. Stop waitlist promotions at the same cutoff.
35. Cutoff is developer-configurable, not Rex/admin-configurable in MVP.

## Waitlist

36. Capacity ordering is first come, first served.
37. Full sessions may use a FIFO waitlist.
38. Waitlisted customers do not pay while merely waiting.
39. When a slot is released before cutoff, promote the next eligible FIFO customer.
40. Promoted customers receive the normal hold calculation from promotion time.
41. Do not promote a new customer after the promotion cutoff.

## Cancellations

42. Customer cancellation is a request, not instant cancellation.
43. While cancellation is pending, the slot remains locked.
44. Admin completes the cancellation.
45. Refunds are manual.
46. MVP supports refund, not store credit.
47. A gym/admin cancelled class also uses manual refund handling for paid customers.

## Rescheduling

48. Customers may submit reschedule requests online.
49. Admin resolves reschedule requests.
50. Customers/coaches do not directly alter coach schedules.
51. Detailed reschedule pricing/cutoff policy remains open.

## Check-in and attendance

52. Admin performs manual check-in.
53. Customers should have an in-app confirmed booking they can show staff.
54. No-show receives no refund.

## Records

55. Expired/rejected/cancelled/no-show bookings remain in history.
56. Refund state should be tracked separately enough to know whether money has actually been returned.
57. Important admin actions/status changes should be auditable.

## Notifications

58. In-app booking status is required.
59. Email via Resend is optional for MVP and must not be required for booking correctness.

## Admins

60. Initial admins are Coach Rex and his wife.
61. Approximately five coaches exist initially.
62. Admin can manage coaches, sessions, bookings, payment review, cancellation/reschedule requests, refunds state, and check-in.

## Do not invent

63. Do not invent a cancellation deadline until Coach Rex defines it.
64. Do not invent reschedule price-difference rules.
65. Do not invent legal waiver text.
66. Do not add automated payments, memberships, or coach self-service to MVP without a deliberate scope change.

## Financial and inventory canonical rules

67. Coach compensation/rates are internal admin-only data.
68. Coach compensation must not appear on public coach pages or customer-facing booking screens.
69. A coach may have an internal default rate and rate type such as per-session or per-hour.
70. Scheduled sessions must snapshot customer price and coach-rate data needed for historical reporting.
71. Changing a coach's current default rate must not rewrite historical session costs.
72. For Balanse reporting, class capacity is the primary sellable inventory.
73. Basic admin reporting should support gross sales, refunds, net sales, coach costs, and capacity/occupancy utilization.
74. Waitlisted customers must not be counted as sales.
75. Unpaid held reservations must not be counted as revenue.
76. Refunded bookings remain in history and must not be erased from reports.
77. Session contribution may be calculated as gross session revenue minus coach cost.
78. Session contribution must not be labeled as profit unless all relevant business costs are included.
79. These reports are operational and do not replace formal accounting records.
