import type { BookingStatus, EventStatus, RefundStatus } from "./enums";
import { BOOKING_STATUSES } from "./enums";
import type { PublicSession } from "./types";

/**
 * The 14 customer-facing rows from docs/screen-specs/shared/02-status-language.md.
 * Refund rows live beside booking rows so a single badge map stays exhaustive.
 */
export const CUSTOMER_STATUS_KEYS = [...BOOKING_STATUSES, "REFUND_PENDING", "REFUNDED"] as const;

export type CustomerStatusKey = (typeof CUSTOMER_STATUS_KEYS)[number];

type ExhaustiveStatusLabels = { [K in CustomerStatusKey]: string };

/**
 * Type-level exhaustiveness: adding a key to `CUSTOMER_STATUS_KEYS` (or a
 * booking status enum value) fails compilation until a label is added here.
 */
export const CUSTOMER_STATUS_LABELS = {
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
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
} as const satisfies ExhaustiveStatusLabels;

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  WAITLISTED: CUSTOMER_STATUS_LABELS.WAITLISTED,
  HELD_AWAITING_PAYMENT: CUSTOMER_STATUS_LABELS.HELD_AWAITING_PAYMENT,
  PAYMENT_SUBMITTED: CUSTOMER_STATUS_LABELS.PAYMENT_SUBMITTED,
  CONFIRMED: CUSTOMER_STATUS_LABELS.CONFIRMED,
  CANCELLATION_REQUESTED: CUSTOMER_STATUS_LABELS.CANCELLATION_REQUESTED,
  RESCHEDULE_REQUESTED: CUSTOMER_STATUS_LABELS.RESCHEDULE_REQUESTED,
  CANCELLED: CUSTOMER_STATUS_LABELS.CANCELLED,
  REJECTED: CUSTOMER_STATUS_LABELS.REJECTED,
  EXPIRED: CUSTOMER_STATUS_LABELS.EXPIRED,
  CHECKED_IN: CUSTOMER_STATUS_LABELS.CHECKED_IN,
  COMPLETED: CUSTOMER_STATUS_LABELS.COMPLETED,
  NO_SHOW: CUSTOMER_STATUS_LABELS.NO_SHOW,
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  NOT_APPLICABLE: "",
  REFUND_PENDING: CUSTOMER_STATUS_LABELS.REFUND_PENDING,
  REFUNDED: CUSTOMER_STATUS_LABELS.REFUNDED,
};

export function customerStatusLabel(status: CustomerStatusKey): string {
  return CUSTOMER_STATUS_LABELS[status];
}

export function bookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status];
}

export function refundStatusLabel(status: RefundStatus): string {
  return REFUND_STATUS_LABELS[status];
}

/** Prefer the refund label when a refund is in flight or complete. */
export function bookingSurfaceLabel(input: {
  status: BookingStatus;
  refundStatus?: RefundStatus;
}): string {
  if (input.refundStatus === "REFUND_PENDING" || input.refundStatus === "REFUNDED") {
    return customerStatusLabel(input.refundStatus);
  }
  return bookingStatusLabel(input.status);
}

export function isRawStatusToken(value: string): boolean {
  return (CUSTOMER_STATUS_KEYS as readonly string[]).includes(value);
}

/**
 * Session availability, in the same words the public booking calendar uses.
 * Shared so the reschedule picker cannot drift from the calendar vocabulary.
 */
export const SESSION_AVAILABILITY_LABELS: Record<PublicSession["availability"], string> = {
  open: "Open",
  nearly_full: "Almost full",
  full_with_waitlist: "Full · waitlist available",
  past: "Past",
  cancelled: "Cancelled",
  past_cutoff: "Booking closed",
};

export function sessionAvailabilityLabel(availability: PublicSession["availability"]): string {
  return SESSION_AVAILABILITY_LABELS[availability];
}

/**
 * Staff labels for the four event states (#317). Distinct from session status:
 * an event can be archived while its session stays published, and an event
 * cannot be published while its session is still draft.
 */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export function eventStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_LABELS[status];
}
