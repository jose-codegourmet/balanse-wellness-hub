import type {
  BundleAcquisition,
  BundleAuditEvent,
  BundleDefinition,
  BundleRedemption,
  BundleStatus,
  CustomerBooking,
  CustomerEntitlement,
  PublicBundle,
  PublicSession,
} from "@balanse/domain";
import {
  addValidityDays,
  countRedemptions,
  deriveEntitlementStatus,
  entitlementEligibleForSession,
  snapshotBundle,
} from "@balanse/domain";
import { MOCK_NOW_ISO } from "./fixtures";

export class BundleError extends Error {
  constructor(
    message: string,
    readonly code:
      | "BUNDLE_NOT_FOUND"
      | "BUNDLE_NOT_PUBLISHED"
      | "BUNDLE_NOT_FREE"
      | "BUNDLE_NOT_PAID"
      | "ACQUISITION_LIMIT"
      | "ENTITLEMENT_NOT_FOUND"
      | "ENTITLEMENT_NOT_ELIGIBLE"
      | "CREDIT_EXHAUSTED"
      | "REDEMPTION_EXISTS"
      | "OVERRIDE_REQUIRED",
  ) {
    super(message);
    this.name = "BundleError";
  }
}

export type BundleState = {
  bundles: BundleDefinition[];
  acquisitions: BundleAcquisition[];
  entitlements: CustomerEntitlement[];
  redemptions: BundleRedemption[];
  audits: BundleAuditEvent[];
};

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export function toPublicBundle(bundle: BundleDefinition): PublicBundle {
  return {
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    summary: bundle.summary,
    description: bundle.description,
    sessionCredits: bundle.sessionCredits,
    pricePhp: bundle.pricePhp,
    applicability: bundle.applicability,
    validityDays: bundle.validityDays,
    perCustomerLimit: bundle.perCustomerLimit,
    status: bundle.status,
  };
}

export function materializeEntitlement(
  state: BundleState,
  entitlement: CustomerEntitlement,
  nowIso = MOCK_NOW_ISO,
): CustomerEntitlement {
  const counts = countRedemptions(
    state.redemptions.filter((row) => row.entitlementId === entitlement.id),
  );
  const remainingCredits = counts.remainingFrom(entitlement.grantedCredits);
  const acquisition = state.acquisitions.find((row) => row.id === entitlement.acquisitionId);
  const status = deriveEntitlementStatus({
    revokedAt: entitlement.revokedAt,
    expiresAt: entitlement.expiresAt,
    remainingCredits,
    acquisitionPending:
      acquisition?.status === "PENDING_REVIEW" || acquisition?.status === "PENDING_PAYMENT",
    nowIso,
  });
  return {
    ...entitlement,
    remainingCredits,
    heldCredits: counts.held,
    consumedCredits: counts.consumed,
    restoredCredits: counts.restored,
    status,
  };
}

export function listPublishedBundles(state: BundleState): PublicBundle[] {
  return state.bundles.filter((row) => row.status === "PUBLISHED").map(toPublicBundle);
}

function countCustomerAcquisitions(
  state: BundleState,
  customerId: string,
  bundleId: string,
): number {
  return state.acquisitions.filter(
    (row) =>
      row.customerId === customerId &&
      row.bundleId === bundleId &&
      (row.status === "ACTIVE" ||
        row.status === "PENDING_REVIEW" ||
        row.status === "PENDING_PAYMENT"),
  ).length;
}

function assertPublished(bundle: BundleDefinition | undefined): BundleDefinition {
  if (!bundle) throw new BundleError("That package was not found.", "BUNDLE_NOT_FOUND");
  if (bundle.status !== "PUBLISHED") {
    throw new BundleError("Only published packages can be claimed.", "BUNDLE_NOT_PUBLISHED");
  }
  return bundle;
}

function findIdempotentAcquisition(
  state: BundleState,
  key: string | undefined,
): BundleAcquisition | undefined {
  if (!key) return undefined;
  return state.acquisitions.find((row) => row.idempotencyKey === key);
}

function writeAudit(
  state: BundleState,
  event: Omit<BundleAuditEvent, "id" | "createdAt"> & { createdAt?: string },
): void {
  state.audits.unshift({
    id: nextId("audit"),
    createdAt: event.createdAt ?? MOCK_NOW_ISO,
    ...event,
  });
}

function activateEntitlement(
  state: BundleState,
  acquisition: BundleAcquisition,
  bundle: BundleDefinition,
): CustomerEntitlement {
  const existing = state.entitlements.find((row) => row.acquisitionId === acquisition.id);
  if (existing) return materializeEntitlement(state, existing);
  const entitlement: CustomerEntitlement = {
    id: nextId("ent"),
    customerId: acquisition.customerId,
    bundleId: bundle.id,
    acquisitionId: acquisition.id,
    snapshot: snapshotBundle(bundle),
    grantedCredits: bundle.sessionCredits,
    remainingCredits: bundle.sessionCredits,
    heldCredits: 0,
    consumedCredits: 0,
    restoredCredits: 0,
    status: "ACTIVE",
    expiresAt: bundle.validityDays ? addValidityDays(MOCK_NOW_ISO, bundle.validityDays) : null,
    revokedAt: null,
    createdAt: MOCK_NOW_ISO,
  };
  acquisition.status = "ACTIVE";
  acquisition.entitlementId = entitlement.id;
  acquisition.reviewedAt = MOCK_NOW_ISO;
  state.entitlements.unshift(entitlement);
  return materializeEntitlement(state, entitlement);
}

export function claimFreeBundle(
  state: BundleState,
  input: { customerId: string; bundleId: string; idempotencyKey?: string },
): CustomerEntitlement {
  const key = input.idempotencyKey ?? `claim:${input.customerId}:${input.bundleId}`;
  const existing = findIdempotentAcquisition(state, key);
  if (existing?.entitlementId) {
    const ent = state.entitlements.find((row) => row.id === existing.entitlementId);
    if (ent) return materializeEntitlement(state, ent);
  }
  const bundle = assertPublished(state.bundles.find((row) => row.id === input.bundleId));
  if (bundle.pricePhp !== 0) {
    throw new BundleError("This package is paid. Request it for studio review.", "BUNDLE_NOT_FREE");
  }
  if (
    bundle.perCustomerLimit &&
    countCustomerAcquisitions(state, input.customerId, bundle.id) >= bundle.perCustomerLimit
  ) {
    throw new BundleError("You already have this package.", "ACQUISITION_LIMIT");
  }
  const acquisition: BundleAcquisition = {
    id: nextId("acq"),
    customerId: input.customerId,
    bundleId: bundle.id,
    bundleName: bundle.name,
    channel: "SELF_CLAIM",
    status: "ACTIVE",
    pricePhp: 0,
    note: null,
    overrideLimit: false,
    idempotencyKey: key,
    entitlementId: null,
    createdAt: MOCK_NOW_ISO,
    reviewedAt: MOCK_NOW_ISO,
    rejectReason: null,
  };
  state.acquisitions.unshift(acquisition);
  const entitlement = activateEntitlement(state, acquisition, bundle);
  writeAudit(state, {
    action: "ACQUISITION_CLAIMED",
    actorType: "customer",
    actorId: input.customerId,
    customerId: input.customerId,
    bundleId: bundle.id,
    entitlementId: entitlement.id,
    bookingId: null,
    sessionId: null,
    reason: null,
  });
  return entitlement;
}

export function requestPaidBundle(
  state: BundleState,
  input: { customerId: string; bundleId: string; idempotencyKey?: string },
): BundleAcquisition {
  const key = input.idempotencyKey ?? `purchase:${input.customerId}:${input.bundleId}`;
  const existing = findIdempotentAcquisition(state, key);
  if (existing) return existing;
  const bundle = assertPublished(state.bundles.find((row) => row.id === input.bundleId));
  if (bundle.pricePhp <= 0) {
    throw new BundleError(
      "This package is free. Claim it instead of requesting payment.",
      "BUNDLE_NOT_PAID",
    );
  }
  if (
    bundle.perCustomerLimit &&
    countCustomerAcquisitions(state, input.customerId, bundle.id) >= bundle.perCustomerLimit
  ) {
    throw new BundleError("You already have this package.", "ACQUISITION_LIMIT");
  }
  const acquisition: BundleAcquisition = {
    id: nextId("acq"),
    customerId: input.customerId,
    bundleId: bundle.id,
    bundleName: bundle.name,
    channel: "SELF_PURCHASE",
    status: "PENDING_REVIEW",
    pricePhp: bundle.pricePhp,
    note: null,
    overrideLimit: false,
    idempotencyKey: key,
    entitlementId: null,
    createdAt: MOCK_NOW_ISO,
    reviewedAt: null,
    rejectReason: null,
  };
  state.acquisitions.unshift(acquisition);
  writeAudit(state, {
    action: "ACQUISITION_REQUESTED",
    actorType: "customer",
    actorId: input.customerId,
    customerId: input.customerId,
    bundleId: bundle.id,
    entitlementId: null,
    bookingId: null,
    sessionId: null,
    reason: null,
  });
  return acquisition;
}

export function grantCustomerBundle(
  state: BundleState,
  input: {
    customerId: string;
    bundleId: string;
    note?: string;
    overrideLimit?: boolean;
    actorId?: string;
    idempotencyKey?: string;
  },
): CustomerEntitlement {
  const key =
    input.idempotencyKey ?? `grant:${input.customerId}:${input.bundleId}:${input.note ?? ""}`;
  const existing = findIdempotentAcquisition(state, key);
  if (existing?.entitlementId) {
    const ent = state.entitlements.find((row) => row.id === existing.entitlementId);
    if (ent) return materializeEntitlement(state, ent);
  }
  const bundle = assertPublished(state.bundles.find((row) => row.id === input.bundleId));
  const used = countCustomerAcquisitions(state, input.customerId, bundle.id);
  if (bundle.perCustomerLimit && used >= bundle.perCustomerLimit && !input.overrideLimit) {
    throw new BundleError(
      "This customer already reached the package limit. Confirm an override to grant another.",
      "OVERRIDE_REQUIRED",
    );
  }
  const acquisition: BundleAcquisition = {
    id: nextId("acq"),
    customerId: input.customerId,
    bundleId: bundle.id,
    bundleName: bundle.name,
    channel: "ADMIN_GRANT",
    status: "ACTIVE",
    pricePhp: bundle.pricePhp,
    note: input.note ?? null,
    overrideLimit: Boolean(input.overrideLimit),
    idempotencyKey: key,
    entitlementId: null,
    createdAt: MOCK_NOW_ISO,
    reviewedAt: MOCK_NOW_ISO,
    rejectReason: null,
  };
  state.acquisitions.unshift(acquisition);
  const entitlement = activateEntitlement(state, acquisition, bundle);
  writeAudit(state, {
    action: input.overrideLimit ? "LIMIT_OVERRIDE" : "ENTITLEMENT_GRANTED",
    actorType: "staff",
    actorId: input.actorId ?? "staff-rex",
    customerId: input.customerId,
    bundleId: bundle.id,
    entitlementId: entitlement.id,
    bookingId: null,
    sessionId: null,
    reason: input.note ?? null,
  });
  return entitlement;
}

export function approveAcquisition(
  state: BundleState,
  id: string,
  actorId = "staff-rex",
): CustomerEntitlement {
  const acquisition = state.acquisitions.find((row) => row.id === id);
  if (!acquisition)
    throw new BundleError("That package request was not found.", "BUNDLE_NOT_FOUND");
  if (acquisition.entitlementId) {
    const existing = state.entitlements.find((row) => row.id === acquisition.entitlementId);
    if (existing) return materializeEntitlement(state, existing);
  }
  const bundle = assertPublished(state.bundles.find((row) => row.id === acquisition.bundleId));
  const entitlement = activateEntitlement(state, acquisition, bundle);
  writeAudit(state, {
    action: "ACQUISITION_APPROVED",
    actorType: "staff",
    actorId,
    customerId: acquisition.customerId,
    bundleId: bundle.id,
    entitlementId: entitlement.id,
    bookingId: null,
    sessionId: null,
    reason: null,
  });
  return entitlement;
}

export function rejectAcquisition(
  state: BundleState,
  id: string,
  reason: string,
  actorId = "staff-rex",
): BundleAcquisition {
  const acquisition = state.acquisitions.find((row) => row.id === id);
  if (!acquisition)
    throw new BundleError("That package request was not found.", "BUNDLE_NOT_FOUND");
  if (acquisition.status === "REJECTED") return acquisition;
  acquisition.status = "REJECTED";
  acquisition.reviewedAt = MOCK_NOW_ISO;
  acquisition.rejectReason = reason;
  writeAudit(state, {
    action: "ACQUISITION_REJECTED",
    actorType: "staff",
    actorId,
    customerId: acquisition.customerId,
    bundleId: acquisition.bundleId,
    entitlementId: null,
    bookingId: null,
    sessionId: null,
    reason,
  });
  return acquisition;
}

export function revokeEntitlement(
  state: BundleState,
  input: { entitlementId: string; reason: string; actorId?: string },
): CustomerEntitlement {
  const entitlement = state.entitlements.find((row) => row.id === input.entitlementId);
  if (!entitlement) throw new BundleError("That package was not found.", "ENTITLEMENT_NOT_FOUND");
  entitlement.revokedAt = entitlement.revokedAt ?? MOCK_NOW_ISO;
  writeAudit(state, {
    action: "ENTITLEMENT_REVOKED",
    actorType: "staff",
    actorId: input.actorId ?? "staff-rex",
    customerId: entitlement.customerId,
    bundleId: entitlement.bundleId,
    entitlementId: entitlement.id,
    bookingId: null,
    sessionId: null,
    reason: input.reason,
  });
  return materializeEntitlement(state, entitlement);
}

export function upsertBundle(
  state: BundleState,
  input: {
    id?: string;
    name: string;
    slug: string;
    summary: string;
    description: string;
    sessionCredits: number;
    pricePhp: number;
    allActiveClasses: boolean;
    classIds: string[];
    validityDays: number | null;
    perCustomerLimit: number | null;
    status: BundleStatus;
  },
): BundleDefinition {
  const slugTaken = state.bundles.find((row) => row.slug === input.slug && row.id !== input.id);
  if (slugTaken) throw new BundleError("That package URL is already in use.", "BUNDLE_NOT_FOUND");
  if (!input.allActiveClasses && input.classIds.length === 0) {
    throw new BundleError(
      "Choose at least one class, or apply the package to all classes.",
      "BUNDLE_NOT_FOUND",
    );
  }
  const existing = input.id ? state.bundles.find((row) => row.id === input.id) : undefined;
  const next: BundleDefinition = {
    id: existing?.id ?? nextId("bundle"),
    name: input.name,
    slug: input.slug,
    summary: input.summary,
    description: input.description,
    sessionCredits: input.sessionCredits,
    pricePhp: input.pricePhp,
    applicability: {
      allActiveClasses: input.allActiveClasses,
      classIds: input.allActiveClasses ? [] : [...input.classIds],
    },
    validityDays: input.validityDays,
    perCustomerLimit: input.perCustomerLimit,
    status: input.status,
    createdAt: existing?.createdAt ?? MOCK_NOW_ISO,
    updatedAt: MOCK_NOW_ISO,
  };
  if (existing) {
    Object.assign(existing, next);
    writeAudit(state, {
      action: "BUNDLE_UPDATED",
      actorType: "staff",
      actorId: "staff-rex",
      customerId: null,
      bundleId: existing.id,
      entitlementId: null,
      bookingId: null,
      sessionId: null,
      reason: null,
    });
    return existing;
  }
  state.bundles.unshift(next);
  writeAudit(state, {
    action: "BUNDLE_CREATED",
    actorType: "staff",
    actorId: "staff-rex",
    customerId: null,
    bundleId: next.id,
    entitlementId: null,
    bookingId: null,
    sessionId: null,
    reason: null,
  });
  return next;
}

export function setBundleStatus(
  state: BundleState,
  id: string,
  status: BundleStatus,
): BundleDefinition {
  const bundle = state.bundles.find((row) => row.id === id);
  if (!bundle) throw new BundleError("That package was not found.", "BUNDLE_NOT_FOUND");
  const previous = bundle.status;
  bundle.status = status;
  bundle.updatedAt = MOCK_NOW_ISO;
  writeAudit(state, {
    action:
      status === "ARCHIVED"
        ? "BUNDLE_ARCHIVED"
        : status === "PUBLISHED"
          ? "BUNDLE_PUBLISHED"
          : "BUNDLE_UNPUBLISHED",
    actorType: "staff",
    actorId: "staff-rex",
    customerId: null,
    bundleId: bundle.id,
    entitlementId: null,
    bookingId: null,
    sessionId: null,
    reason: previous === status ? null : `${previous} → ${status}`,
  });
  return bundle;
}

function entitlementForCustomer(
  state: BundleState,
  customerId: string,
  entitlementId: string,
): CustomerEntitlement {
  const entitlement = state.entitlements.find((row) => row.id === entitlementId);
  if (!entitlement || entitlement.customerId !== customerId) {
    throw new BundleError(
      "That package does not belong to this customer.",
      "ENTITLEMENT_NOT_FOUND",
    );
  }
  return materializeEntitlement(state, entitlement);
}

export function listEligible(
  state: BundleState,
  customerId: string,
  session: PublicSession,
): CustomerEntitlement[] {
  return state.entitlements
    .filter((row) => row.customerId === customerId)
    .map((row) => materializeEntitlement(state, row))
    .filter((row) =>
      entitlementEligibleForSession({
        entitlement: row,
        classId: session.classId,
        sessionStartsAt: session.startsAt,
        nowIso: MOCK_NOW_ISO,
      }),
    );
}

export function holdCredit(
  state: BundleState,
  input: {
    customerId: string;
    entitlementId: string;
    booking: CustomerBooking;
    session: PublicSession;
  },
): BundleRedemption {
  const open = state.redemptions.find(
    (row) => row.bookingId === input.booking.id && row.status !== "RESTORED",
  );
  if (open) throw new BundleError("This booking already uses a package.", "REDEMPTION_EXISTS");
  const entitlement = entitlementForCustomer(state, input.customerId, input.entitlementId);
  if (
    !entitlementEligibleForSession({
      entitlement,
      classId: input.session.classId,
      sessionStartsAt: input.session.startsAt,
      nowIso: MOCK_NOW_ISO,
    })
  ) {
    throw new BundleError(
      "That package cannot be used for this class or session time.",
      "ENTITLEMENT_NOT_ELIGIBLE",
    );
  }
  if (entitlement.remainingCredits <= 0) {
    throw new BundleError("No sessions remaining on this package.", "CREDIT_EXHAUSTED");
  }
  const redemption: BundleRedemption = {
    id: nextId("red"),
    entitlementId: entitlement.id,
    bookingId: input.booking.id,
    sessionId: input.session.id,
    status: "HELD",
    createdAt: MOCK_NOW_ISO,
    consumedAt: null,
    restoredAt: null,
  };
  state.redemptions.unshift(redemption);
  writeAudit(state, {
    action: "CREDIT_HELD",
    actorType: "customer",
    actorId: input.customerId,
    customerId: input.customerId,
    bundleId: entitlement.bundleId,
    entitlementId: entitlement.id,
    bookingId: input.booking.id,
    sessionId: input.session.id,
    reason: null,
  });
  return redemption;
}

export function consumeCredit(state: BundleState, bookingId: string): void {
  const redemption = state.redemptions.find(
    (row) => row.bookingId === bookingId && row.status === "HELD",
  );
  if (!redemption) return;
  redemption.status = "CONSUMED";
  redemption.consumedAt = MOCK_NOW_ISO;
  const entitlement = state.entitlements.find((row) => row.id === redemption.entitlementId);
  writeAudit(state, {
    action: "CREDIT_CONSUMED",
    actorType: "staff",
    actorId: "staff-rex",
    customerId: entitlement?.customerId ?? null,
    bundleId: entitlement?.bundleId ?? null,
    entitlementId: redemption.entitlementId,
    bookingId,
    sessionId: redemption.sessionId,
    reason: null,
  });
}

export function restoreCredit(state: BundleState, bookingId: string, reason: string): void {
  const redemption = state.redemptions.find(
    (row) => row.bookingId === bookingId && row.status === "HELD",
  );
  if (!redemption) return;
  redemption.status = "RESTORED";
  redemption.restoredAt = MOCK_NOW_ISO;
  const entitlement = state.entitlements.find((row) => row.id === redemption.entitlementId);
  writeAudit(state, {
    action: "CREDIT_RESTORED",
    actorType: "system",
    actorId: "system",
    customerId: entitlement?.customerId ?? null,
    bundleId: entitlement?.bundleId ?? null,
    entitlementId: redemption.entitlementId,
    bookingId,
    sessionId: redemption.sessionId,
    reason,
  });
}

export function moveRedemption(
  state: BundleState,
  booking: CustomerBooking,
  target: PublicSession,
): void {
  const redemption = state.redemptions.find(
    (row) => row.bookingId === booking.id && row.status !== "RESTORED",
  );
  if (!redemption) return;
  const entitlement = entitlementForCustomer(state, booking.customerId, redemption.entitlementId);
  if (
    !entitlementEligibleForSession({
      entitlement,
      classId: target.classId,
      sessionStartsAt: target.startsAt,
      nowIso: MOCK_NOW_ISO,
    })
  ) {
    throw new BundleError(
      "The package cannot move to that class or session time.",
      "ENTITLEMENT_NOT_ELIGIBLE",
    );
  }
  redemption.sessionId = target.id;
}

export function markPromotionBlocked(
  state: BundleState,
  booking: CustomerBooking,
  reason: string,
): void {
  booking.packagePromotionBlocked = true;
  writeAudit(state, {
    action: "WAITLIST_PROMOTION_BLOCKED",
    actorType: "system",
    actorId: "system",
    customerId: booking.customerId,
    bundleId: null,
    entitlementId: booking.intendedEntitlementId ?? null,
    bookingId: booking.id,
    sessionId: booking.sessionId,
    reason,
  });
}
