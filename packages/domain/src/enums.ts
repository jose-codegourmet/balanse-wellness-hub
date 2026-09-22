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

/**
 * Legacy persisted enum (BE-001 / current Prisma `StaffRole`).
 * Authorization truth is `StaffRoleDefinition.key` + `PERMISSION_KEYS` in
 * `roles.ts` / `permissions.ts`. Do not treat this enum as the role matrix.
 */
export const STAFF_ROLES = ["ADMIN"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** BE-058 — catalogue / entitlement / ledger. Customer chrome says “Package”. */
export const BUNDLE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type BundleStatus = (typeof BUNDLE_STATUSES)[number];

export const BUNDLE_APPLICABILITY_MODES = ["ALL_ACTIVE_CLASSES", "EXPLICIT_CLASSES"] as const;
export type BundleApplicabilityMode = (typeof BUNDLE_APPLICABILITY_MODES)[number];

export const BUNDLE_ACQUISITION_KINDS = ["CUSTOMER_CLAIM", "CUSTOMER_PAID", "ADMIN_GRANT"] as const;
export type BundleAcquisitionKind = (typeof BUNDLE_ACQUISITION_KINDS)[number];

export const BUNDLE_ACQUISITION_STATUSES = [
  "PENDING_PAYMENT",
  "PENDING_REVIEW",
  "APPROVED",
  "ACTIVE",
  "REJECTED",
  "CANCELLED",
] as const;
export type BundleAcquisitionStatus = (typeof BUNDLE_ACQUISITION_STATUSES)[number];

export const CUSTOMER_BUNDLE_STATUSES = ["ACTIVE", "EXHAUSTED", "EXPIRED", "REVOKED"] as const;
export type CustomerBundleStatus = (typeof CUSTOMER_BUNDLE_STATUSES)[number];

export const BUNDLE_REDEMPTION_STATUSES = ["HELD", "CONSUMED", "RESTORED"] as const;
export type BundleRedemptionStatus = (typeof BUNDLE_REDEMPTION_STATUSES)[number];

export const SESSION_SLOTS_MANILA = [
  "08:00",
  "09:30",
  "11:00",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
] as const;
