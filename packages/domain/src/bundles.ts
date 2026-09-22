/**
 * Session bundles (customer-facing name: packages).
 * Credits are session entitlements, never cash, store credit, or a wallet.
 */

import { classSlug } from "./classes";
import type {
  BundleAcquisitionKind,
  BundleAcquisitionStatus,
  BundleApplicabilityMode,
  BundleRedemptionStatus,
  BundleStatus,
  CustomerBundleStatus,
  PaymentMethod,
  PaymentStatus,
} from "./enums";

/** Admin/backend name. Customer-facing copy is always “Package”. */
export const PACKAGE_CUSTOMER_LABEL = "Package";

export const BUNDLE_ACQUISITION_CHANNELS = ["SELF_CLAIM", "SELF_PURCHASE", "ADMIN_GRANT"] as const;
export type BundleAcquisitionChannel = (typeof BUNDLE_ACQUISITION_CHANNELS)[number];

export const ENTITLEMENT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "EXHAUSTED",
  "EXPIRED",
  "REVOKED",
] as const;
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];

export const REDEMPTION_STATUSES = ["HELD", "CONSUMED", "RESTORED"] as const;
export type RedemptionStatus = (typeof REDEMPTION_STATUSES)[number];

export const BUNDLE_AUDIT_ACTIONS = [
  "BUNDLE_CREATED",
  "BUNDLE_UPDATED",
  "BUNDLE_PUBLISHED",
  "BUNDLE_UNPUBLISHED",
  "BUNDLE_ARCHIVED",
  "ACQUISITION_CLAIMED",
  "ACQUISITION_REQUESTED",
  "ACQUISITION_APPROVED",
  "ACQUISITION_REJECTED",
  "ENTITLEMENT_GRANTED",
  "ENTITLEMENT_REVOKED",
  "LIMIT_OVERRIDE",
  "CREDIT_HELD",
  "CREDIT_CONSUMED",
  "CREDIT_RESTORED",
  "WAITLIST_PROMOTION_BLOCKED",
] as const;
export type BundleAuditAction = (typeof BUNDLE_AUDIT_ACTIONS)[number];

export const BUNDLE_STATUS_LABELS: Record<BundleStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ENTITLEMENT_STATUS_LABELS: Record<EntitlementStatus, string> = {
  PENDING: "Awaiting review",
  ACTIVE: "Active",
  EXHAUSTED: "All sessions used",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const REDEMPTION_STATUS_LABELS: Record<RedemptionStatus, string> = {
  HELD: "Held for a booking",
  CONSUMED: "Used",
  RESTORED: "Restored",
};

export const BUNDLE_ACQUISITION_STATUS_LABELS: Record<BundleAcquisitionStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PENDING_REVIEW: "Awaiting studio review",
  APPROVED: "Approved",
  ACTIVE: "Approved",
  REJECTED: "Not approved",
  CANCELLED: "Cancelled",
};

export type BundleApplicability = {
  allActiveClasses: boolean;
  classIds: string[];
};

export type BundleDefinition = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  sessionCredits: number;
  pricePhp: number;
  applicability: BundleApplicability;
  validityDays: number | null;
  perCustomerLimit: number | null;
  status: BundleStatus;
  createdAt: string;
  updatedAt: string;
};

export type PublicBundle = Pick<
  BundleDefinition,
  | "id"
  | "name"
  | "slug"
  | "summary"
  | "description"
  | "sessionCredits"
  | "pricePhp"
  | "applicability"
  | "validityDays"
  | "perCustomerLimit"
  | "status"
>;

export type PublicPackage = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  sessionCreditCount: number;
  pricePhp: number;
  applicabilityMode: BundleApplicabilityMode;
  classIds: string[];
  validityDays: number | null;
  perCustomerLimit: number | null;
  status: Extract<BundleStatus, "PUBLISHED">;
};

export type AdminBundle = Omit<PublicPackage, "status"> & {
  status: BundleStatus;
  createdAt: string;
  updatedAt: string;
};

export type EntitlementSnapshot = {
  name: string;
  sessionCredits: number;
  pricePhp: number;
  applicability: BundleApplicability;
  validityDays: number | null;
};

export type CustomerEntitlement = {
  id: string;
  customerId: string;
  bundleId: string;
  acquisitionId: string;
  snapshot: EntitlementSnapshot;
  grantedCredits: number;
  remainingCredits: number;
  heldCredits: number;
  consumedCredits: number;
  restoredCredits: number;
  status: EntitlementStatus;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type BundleRedemption = {
  id: string;
  entitlementId: string;
  bookingId: string;
  sessionId: string;
  status: RedemptionStatus;
  createdAt: string;
  consumedAt: string | null;
  restoredAt: string | null;
};

export type BundleAcquisition = {
  id: string;
  customerId: string;
  bundleId: string;
  bundleName: string;
  channel: BundleAcquisitionChannel;
  status: BundleAcquisitionStatus;
  pricePhp: number;
  note: string | null;
  overrideLimit: boolean;
  idempotencyKey: string | null;
  entitlementId: string | null;
  createdAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
};

export type BundleAuditEvent = {
  id: string;
  action: BundleAuditAction;
  actorType: "customer" | "staff" | "system";
  actorId: string;
  customerId: string | null;
  bundleId: string | null;
  entitlementId: string | null;
  bookingId: string | null;
  sessionId: string | null;
  reason: string | null;
  createdAt: string;
};

export type EntitlementBalances = {
  granted: number;
  held: number;
  consumed: number;
  restored: number;
  remaining: number;
};

export type HttpBundleRedemption = {
  id: string;
  entitlementId: string;
  bookingId: string;
  sessionId: string;
  status: BundleRedemptionStatus;
  heldAt: string;
  consumedAt: string | null;
  restoredAt: string | null;
  restoreReason: string | null;
};

export type BundleAcquisitionPayment = {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountPhp: number;
  proofObjectKey: string | null;
  submittedAt: string | null;
};

export type HttpBundleAcquisition = {
  id: string;
  bundleId: string;
  profileId: string;
  kind: BundleAcquisitionKind;
  status: BundleAcquisitionStatus;
  idempotencyKey: string;
  overrideLimit: boolean;
  overrideReason: string | null;
  adminNote: string | null;
  rejectionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  payment: BundleAcquisitionPayment | null;
  entitlementId: string | null;
};

export type HttpCustomerEntitlement = {
  id: string;
  bundleId: string;
  profileId: string;
  status: CustomerBundleStatus;
  name: string;
  sessionCreditCount: number;
  pricePhp: number;
  applicabilityMode: BundleApplicabilityMode;
  classIds: string[];
  validityDays: number | null;
  expiresAt: string | null;
  grantedAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
  balances: EntitlementBalances;
  acquisition: HttpBundleAcquisition | null;
  redemptions?: HttpBundleRedemption[];
};

export type EligibleEntitlement = Pick<
  HttpCustomerEntitlement,
  "id" | "name" | "status" | "expiresAt" | "balances" | "classIds" | "applicabilityMode"
>;

export const CONSUMED_BOOKING_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "NO_SHOW",
] as const;

export const RESTORE_BOOKING_STATUSES = ["REJECTED", "EXPIRED", "CANCELLED"] as const;

export function bundleStatusLabel(status: BundleStatus): string {
  return BUNDLE_STATUS_LABELS[status];
}

export function entitlementStatusLabel(status: EntitlementStatus): string {
  return ENTITLEMENT_STATUS_LABELS[status];
}

export function redemptionStatusLabel(status: RedemptionStatus): string {
  return REDEMPTION_STATUS_LABELS[status];
}

export function isPublishedBundle(bundle: Pick<BundleDefinition, "status">): boolean {
  return bundle.status === "PUBLISHED";
}

export function countRedemptions(redemptions: readonly Pick<BundleRedemption, "status">[]): {
  held: number;
  consumed: number;
  restored: number;
  remainingFrom: (granted: number) => number;
} {
  const held = redemptions.filter((row) => row.status === "HELD").length;
  const consumed = redemptions.filter((row) => row.status === "CONSUMED").length;
  const restored = redemptions.filter((row) => row.status === "RESTORED").length;
  return {
    held,
    consumed,
    restored,
    remainingFrom: (granted) => Math.max(0, granted - held - consumed),
  };
}

export function deriveEntitlementStatus(input: {
  revokedAt: string | null;
  expiresAt: string | null;
  remainingCredits: number;
  acquisitionPending: boolean;
  nowIso: string;
}): EntitlementStatus {
  if (input.revokedAt) return "REVOKED";
  if (input.acquisitionPending) return "PENDING";
  if (input.expiresAt && input.expiresAt <= input.nowIso) return "EXPIRED";
  if (input.remainingCredits <= 0) return "EXHAUSTED";
  return "ACTIVE";
}

export function classIsApplicable(
  applicability: BundleApplicability,
  classId: string,
  options?: { treatUnknownAsHistorical?: boolean },
): boolean {
  if (applicability.allActiveClasses) return true;
  if (applicability.classIds.includes(classId)) return true;
  return Boolean(options?.treatUnknownAsHistorical) && applicability.classIds.length === 0;
}

export function entitlementEligibleForSession(input: {
  entitlement: CustomerEntitlement;
  classId: string;
  sessionStartsAt: string;
  nowIso: string;
}): boolean {
  if (input.entitlement.status !== "ACTIVE") return false;
  if (input.entitlement.remainingCredits <= 0) return false;
  if (input.entitlement.expiresAt && input.sessionStartsAt > input.entitlement.expiresAt) {
    return false;
  }
  return classIsApplicable(input.entitlement.snapshot.applicability, input.classId);
}

export function snapshotBundle(bundle: BundleDefinition): EntitlementSnapshot {
  return {
    name: bundle.name,
    sessionCredits: bundle.sessionCredits,
    pricePhp: bundle.pricePhp,
    applicability: {
      allActiveClasses: bundle.applicability.allActiveClasses,
      classIds: [...bundle.applicability.classIds],
    },
    validityDays: bundle.validityDays,
  };
}

export function addValidityDays(fromIso: string, days: number): string {
  const start = new Date(fromIso);
  start.setUTCDate(start.getUTCDate() + days);
  return start.toISOString();
}

export function formatSessionsRemaining(count: number): string {
  return count === 1 ? "1 session remaining" : `${count} sessions remaining`;
}

export function bundleSlug(name: string): string {
  return classSlug(name);
}

export function deriveEntitlementBalances(
  granted: number,
  redemptions: Array<Pick<HttpBundleRedemption, "status">>,
): EntitlementBalances {
  let held = 0;
  let consumed = 0;
  let restored = 0;
  for (const row of redemptions) {
    if (row.status === "HELD") held += 1;
    if (row.status === "CONSUMED") consumed += 1;
    if (row.status === "RESTORED") restored += 1;
  }
  const remaining = Math.max(0, granted - held - consumed);
  return { granted, held, consumed, restored, remaining };
}

export function deriveCustomerBundleStatus(
  current: CustomerBundleStatus,
  balances: EntitlementBalances,
  expiresAt: string | null,
  nowIso: string,
): CustomerBundleStatus {
  if (current === "REVOKED") return "REVOKED";
  if (expiresAt && new Date(expiresAt).getTime() <= new Date(nowIso).getTime()) return "EXPIRED";
  if (balances.remaining <= 0) return "EXHAUSTED";
  return "ACTIVE";
}

export function isEntitlementEligibleForSession(
  entitlement: Pick<
    HttpCustomerEntitlement,
    "status" | "expiresAt" | "balances" | "applicabilityMode" | "classIds" | "profileId"
  >,
  session: { classId: string; startsAt: string },
  customerId: string,
  nowIso: string,
): { ok: true } | { ok: false; code: string } {
  if (entitlement.profileId !== customerId) return { ok: false, code: "entitlement_foreign" };
  if (entitlement.status === "REVOKED") return { ok: false, code: "entitlement_revoked" };
  if (entitlement.status === "EXPIRED") return { ok: false, code: "entitlement_expired" };
  if (
    entitlement.expiresAt &&
    new Date(session.startsAt).getTime() >= new Date(entitlement.expiresAt).getTime()
  ) {
    return { ok: false, code: "entitlement_expired" };
  }
  if (
    entitlement.expiresAt &&
    new Date(entitlement.expiresAt).getTime() <= new Date(nowIso).getTime()
  ) {
    return { ok: false, code: "entitlement_expired" };
  }
  if (
    entitlement.applicabilityMode === "EXPLICIT_CLASSES" &&
    !entitlement.classIds.includes(session.classId)
  ) {
    return { ok: false, code: "entitlement_ineligible_class" };
  }
  if (entitlement.balances.remaining <= 0) return { ok: false, code: "entitlement_exhausted" };
  if (entitlement.status !== "ACTIVE") return { ok: false, code: "entitlement_not_usable" };
  return { ok: true };
}

export function sessionsRemainingCopy(remaining: number): string {
  const noun = remaining === 1 ? "session" : "sessions";
  return `${remaining} ${noun} remaining`;
}

export function claimIdempotencyKey(profileId: string, bundleId: string): string {
  return `customer-claim:${profileId}:${bundleId}`;
}

export function paidAcquisitionIdempotencyKey(profileId: string, bundleId: string): string {
  return `customer-paid:${profileId}:${bundleId}`;
}
