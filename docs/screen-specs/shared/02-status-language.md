# Shared — Status Language

| Internal | Customer label |
|---|---|
| WAITLISTED | Waitlisted |
| HELD_AWAITING_PAYMENT | Reserved — Payment Needed |
| PAYMENT_SUBMITTED | Payment Under Review |
| CONFIRMED | Confirmed |
| CANCELLATION_REQUESTED | Cancellation Requested |
| RESCHEDULE_REQUESTED | Reschedule Requested |
| CANCELLED | Cancelled |
| REJECTED | Not Confirmed |
| EXPIRED | Reservation Expired |
| CHECKED_IN | Checked In |
| COMPLETED | Completed |
| NO_SHOW | No-show |
| REFUND_PENDING | Refund Pending |
| REFUNDED | Refunded |

Never expose raw enum names to users.

## Admin events

Staff labels for `EventStatus`. These are not session statuses and not customer booking labels.

| Internal | Staff label |
|---|---|
| DRAFT | Draft |
| PUBLISHED | Published |
| CANCELLED | Cancelled |
| ARCHIVED | Archived |
