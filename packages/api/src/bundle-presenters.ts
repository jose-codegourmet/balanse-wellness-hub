import type { Prisma } from "@balanse/db";
import {
  type AdminBundle,
  type BundleCreditMetrics,
  deriveEntitlementBalances,
  type HttpBundleAcquisition,
  type HttpBundleRedemption,
  type HttpCustomerEntitlement,
  type PublicPackage,
} from "@balanse/domain";
import { money } from "./presenters";

const entitlementInclude = {
  redemptions: { orderBy: { createdAt: "asc" as const } },
  acquisition: { include: { payment: true } },
} satisfies Prisma.CustomerBundleInclude;

export type EntitlementRow = Prisma.CustomerBundleGetPayload<{
  include: typeof entitlementInclude;
}>;

export const entitlementWithLedger = entitlementInclude;

export function presentPublicPackage(row: {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  sessionCreditCount: number;
  pricePhp: Prisma.Decimal | string | number;
  applicabilityMode: PublicPackage["applicabilityMode"];
  validityDays: number | null;
  perCustomerLimit: number | null;
  classApplicability?: Array<{ classId: string }>;
}): PublicPackage {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    sessionCreditCount: row.sessionCreditCount,
    pricePhp: Number(money(row.pricePhp)),
    applicabilityMode: row.applicabilityMode,
    classIds: (row.classApplicability ?? []).map((item) => item.classId),
    validityDays: row.validityDays,
    perCustomerLimit: row.perCustomerLimit,
    status: "PUBLISHED",
  };
}

export function presentAdminBundle(row: {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  sessionCreditCount: number;
  pricePhp: Prisma.Decimal | string | number;
  applicabilityMode: AdminBundle["applicabilityMode"];
  validityDays: number | null;
  perCustomerLimit: number | null;
  status: AdminBundle["status"];
  createdAt: Date;
  updatedAt: Date;
  classApplicability?: Array<{ classId: string }>;
  entitlements?: Array<{
    snapshotSessionCreditCount: number;
    redemptions: Array<{ status: "HELD" | "CONSUMED" | "RESTORED" }>;
  }>;
}): AdminBundle {
  return {
    ...presentPublicPackage({ ...row, classApplicability: row.classApplicability }),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    metrics: presentBundleCreditMetrics(row.entitlements ?? []),
  };
}

/** Derives aggregate bundle usage directly from the append-only redemption ledger. */
export function presentBundleCreditMetrics(
  entitlements: Array<{
    snapshotSessionCreditCount: number;
    redemptions: Array<{ status: "HELD" | "CONSUMED" | "RESTORED" }>;
  }>,
): BundleCreditMetrics {
  return entitlements.reduce<BundleCreditMetrics>(
    (total, entitlement) => {
      const ledger = entitlement.redemptions.reduce(
        (credits, redemption) => ({
          held: credits.held + Number(redemption.status === "HELD"),
          used: credits.used + Number(redemption.status === "CONSUMED"),
          restored: credits.restored + Number(redemption.status === "RESTORED"),
        }),
        { held: 0, used: 0, restored: 0 },
      );
      return {
        granted: total.granted + entitlement.snapshotSessionCreditCount,
        held: total.held + ledger.held,
        used: total.used + ledger.used,
        restored: total.restored + ledger.restored,
        owners: total.owners + 1,
      };
    },
    { granted: 0, held: 0, used: 0, restored: 0, owners: 0 },
  );
}

export function presentAcquisition(
  row:
    | Prisma.BundleAcquisitionGetPayload<{ include: { payment: true; entitlement: true } }>
    | (Prisma.BundleAcquisitionGetPayload<{
        include: { payment: true };
      }> & { entitlement?: { id: string } | null }),
): HttpBundleAcquisition {
  const payment = "payment" in row ? row.payment : null;
  const entitlementId =
    "entitlement" in row && row.entitlement
      ? row.entitlement.id
      : ((row as { entitlementId?: string }).entitlementId ?? null);
  return {
    id: row.id,
    bundleId: row.bundleId,
    profileId: row.profileId,
    kind: row.kind,
    status: row.status,
    idempotencyKey: row.idempotencyKey,
    overrideLimit: row.overrideLimit,
    overrideReason: row.overrideReason,
    adminNote: row.adminNote,
    rejectionNote: row.rejectionNote,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    payment: payment
      ? {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          amountPhp: Number(money(payment.amount)),
          proofObjectKey: payment.proofObjectKey,
          submittedAt: payment.submittedAt?.toISOString() ?? null,
        }
      : null,
    entitlementId,
  };
}

export function presentRedemption(
  row: Prisma.BundleRedemptionGetPayload<object>,
): HttpBundleRedemption {
  return {
    id: row.id,
    entitlementId: row.entitlementId,
    bookingId: row.bookingId,
    sessionId: row.sessionId,
    status: row.status,
    heldAt: row.heldAt.toISOString(),
    consumedAt: row.consumedAt?.toISOString() ?? null,
    restoredAt: row.restoredAt?.toISOString() ?? null,
    restoreReason: row.restoreReason,
  };
}

export function presentEntitlement(row: EntitlementRow): HttpCustomerEntitlement {
  const redemptions = row.redemptions.map(presentRedemption);
  const balances = deriveEntitlementBalances(row.snapshotSessionCreditCount, redemptions);
  return {
    id: row.id,
    bundleId: row.bundleId,
    profileId: row.profileId,
    status: row.status,
    name: row.snapshotName,
    sessionCreditCount: row.snapshotSessionCreditCount,
    pricePhp: Number(money(row.snapshotPricePhp)),
    applicabilityMode: row.snapshotApplicabilityMode,
    classIds: row.snapshotClassIds,
    validityDays: row.snapshotValidityDays,
    expiresAt: row.snapshotExpiresAt?.toISOString() ?? null,
    grantedAt: row.createdAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    revokeReason: row.revokeReason,
    balances,
    acquisition: row.acquisition
      ? presentAcquisition({ ...row.acquisition, entitlement: { id: row.id } })
      : null,
    redemptions,
  };
}
