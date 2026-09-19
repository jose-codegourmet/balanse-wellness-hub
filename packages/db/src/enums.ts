/**
 * BE-001 — Prisma enum re-export for app/server code.
 * Keep in lockstep with `@balanse/domain` (asserted in tests).
 */
export {
  AuditActorType,
  BookingStatus,
  CoachRateType,
  PaymentMethod,
  PaymentStatus,
  PolicyDocumentKind,
  RefundStatus,
  RequestResolution,
  SessionStatus,
  StaffRole,
  StaffStatus,
  WaitlistStatus,
} from "@prisma/client";
