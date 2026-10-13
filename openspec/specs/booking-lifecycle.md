# Spec: Booking lifecycle, requests and attendance

## Requirements

1. One booking reserves one scheduled session for its authenticated customer, who is also the attendee. The booking form reuses known profile details and records affirmative acceptance of required policy versions. Customers may book multiple sessions on the same day, subject to each occurrence's eligibility.
2. New bookings and waitlist promotions stop at the developer-controlled cutoff, initially 15 minutes before start. A successful main-list hold consumes one finite capacity slot until its deadline: `min(reservedAt + 8 hours, sessionStartsAt)` by default. Hold duration and cutoff are not admin-editable.
3. Last-slot allocation is atomic and first come, first served. A full eligible session may accept FIFO waitlist entries; waitlisting consumes no slot and requires no payment. On released capacity before cutoff, the next eligible entry is promoted and gets a fresh hold from promotion time. A pending cancellation request releases nothing.
4. Booking states use the domain vocabulary: `WAITLISTED`, `HELD_AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `CONFIRMED`, `CANCELLATION_REQUESTED`, `RESCHEDULE_REQUESTED`, `CANCELLED`, `REJECTED`, `EXPIRED`, `CHECKED_IN`, `COMPLETED`, `NO_SHOW`. Customer-facing screens show canonical labels rather than raw enums. Booking reference `BWH-…` is the same staff lookup key across booking, payment and request queues.
5. Selecting cash or submitting GCash proof never confirms a booking automatically. Staff reviews evidence or cash receipt, then confirms or rejects. Manual payment rules are in [payments and refunds](payments-and-refunds.md); package credit holds are in [session bundles](session-bundles.md).
6. A customer cancellation is a request. The main-list slot remains occupied while pending; authorized staff complete or reject it. Refund state is independent and manual. A customer reschedule is also a request; the current booking remains protected until staff resolves it against target capacity and policy. No cancellation deadline, automatic refund eligibility or reschedule price-difference rule is invented.
7. Authorized staff or an appropriately scoped assigned coach can read a session roster and mark confirmed attendees checked in or no-show. Customers cannot self-check-in. A no-show receives no refund. `COMPLETED` is vocabulary but its automatic transition is unresolved under OQ-10.
8. Expired, rejected, cancelled, attended and no-show bookings remain in history. Important status changes are audited. In-app status is authoritative even when optional email is absent.
9. Early session end is tracked by the active [session-early-end change](../changes/session-early-end/proposal.md). Until that change is complete, scheduled `endsAt` remains the report and coach-pay duration; do not infer `COMPLETED` bookings from early end.

## Scenarios

- **Final place:** Given one remaining place, when two customers reserve concurrently, only one main-list hold succeeds; the other may waitlist if eligible.
- **Expired hold:** Given an unpaid hold past its effective deadline, when the expiry job runs, the booking stays in history, releases its place, and promotion obeys FIFO and cutoff.
- **Pending request:** Given a confirmed booking, when its customer asks to cancel, its place remains occupied until staff completes the request.

## Surfaces and sources

- Customer: `/portal/book/[sessionId]`, `/portal/bookings/**`, `/portal/schedule`; `/api/bookings/**`.
- Staff: `/bookings/**`, `/cancellations`, `/reschedules`, `/sessions/[sessionId]/roster`; `/api/admin/bookings`, `/cancellation-requests`, `/reschedule-requests`, `/sessions/{id}/roster`.
- Detail: `docs/business-requirements/06-booking-rules.md`, `09-reservation-lifecycle.md`, `10-capacity-and-waitlist.md`, `11-cancellations-and-refunds.md`, `12-rescheduling.md`, `13-check-in-attendance-and-no-show.md`, `docs/backend/jobs.md`.
