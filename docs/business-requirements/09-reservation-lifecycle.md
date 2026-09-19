# 09 — Reservation Lifecycle

## Purpose

A reservation should have an explicit state rather than relying on ambiguous booleans.

Exact database enum naming can differ, but business meaning must be preserved.

## Suggested business states

### WAITLISTED

Customer wants the class but no main slot is currently available.

- Does not consume normal available capacity.
- Ordered FIFO.
- Does not require payment yet.

### HELD_AWAITING_PAYMENT

Customer has a temporary main-list slot.

Used for:

- GCash before proof is submitted
- Pay at Counter before cash is received

Consumes capacity temporarily.

### PAYMENT_SUBMITTED

GCash proof has been uploaded.

- Slot remains held.
- Waiting for admin verification.

### PENDING_ADMIN_CONFIRMATION

Optional implementation state if the system wants to distinguish payment submission from general approval review.

If this creates unnecessary complexity, `PAYMENT_SUBMITTED` may itself mean pending admin review.

### CONFIRMED

Admin has approved the booking.

Customer can treat this as a valid booked class.

### CANCELLATION_REQUESTED

Customer asked to cancel a confirmed/active booking.

- The booking is not yet considered fully cancelled.
- The slot remains locked while admin processes the request.
- Admin handles the refund manually where applicable.

### RESCHEDULE_REQUESTED

Customer asked to move the booking.

Admin must handle the request.

Detailed reschedule slot-transfer rules are still open.

### CANCELLED

The booking was cancelled.

Preserve it in history.

### REJECTED

Admin rejected the reservation.

Possible reasons include:

- payment could not be verified,
- session cannot proceed,
- operational issue.

Refund may be required if money was already received.

### EXPIRED

The customer failed to complete the required payment path before the hold deadline.

The slot becomes available for the next eligible customer/waitlist promotion.

### CHECKED_IN

Admin marked the customer as arrived.

### COMPLETED

Optional post-class state if the product needs a final completed status.

### NO_SHOW

Customer had a valid booking but did not attend.

No refund.

### REFUND_PENDING / REFUNDED

Because refunds are manual, explicit refund tracking is recommended.

A cancellation/rejection and a refund are separate concepts.

For example:

- booking = CANCELLED
- refund = REFUND_PENDING

Then after manual transfer:

- booking = CANCELLED
- refund = REFUNDED

## State-history principle

Status changes should be auditable enough to answer:

- what happened,
- when it happened,
- who performed the admin action,
- whether payment/refund action occurred.
