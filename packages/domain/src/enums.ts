/** BE-001 vocabulary. Do not invent additional business states. */

export const BOOKING_STATUSES = [
  "WAITLISTED",
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
  "CHECKED_IN",
  "COMPLETED",
  "NO_SHOW",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = ["GCASH", "PAY_AT_COUNTER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "NONE",
  "PROOF_SUBMITTED",
  "CASH_RECEIVED",
  "VERIFIED",
  "REJECTED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const REFUND_STATUSES = ["NOT_APPLICABLE", "REFUND_PENDING", "REFUNDED"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const COACH_RATE_TYPES = ["PER_SESSION", "PER_HOUR"] as const;
export type CoachRateType = (typeof COACH_RATE_TYPES)[number];

export const SESSION_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const STAFF_ROLES = ["ADMIN"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const SESSION_SLOTS_MANILA = [
  "08:00",
  "09:30",
  "11:00",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
] as const;
