import type { BookingStatus, RefundStatus } from "./enums";

/** Customer-facing labels from docs/screen-specs/shared/02-status-language.md */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  WAITLISTED: "Waitlisted",
  HELD_AWAITING_PAYMENT: "Reserved — Payment Needed",
  PAYMENT_SUBMITTED: "Payment Under Review",
  CONFIRMED: "Confirmed",
  CANCELLATION_REQUESTED: "Cancellation Requested",
  RESCHEDULE_REQUESTED: "Reschedule Requested",
  CANCELLED: "Cancelled",
  REJECTED: "Not Confirmed",
  EXPIRED: "Reservation Expired",
  CHECKED_IN: "Checked In",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  NOT_APPLICABLE: "",
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
};

export function bookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status];
}

export function refundStatusLabel(status: RefundStatus): string {
  return REFUND_STATUS_LABELS[status];
}
