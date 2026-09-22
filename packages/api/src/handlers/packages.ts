import {
  claimIdempotencyKey,
  FIELD_CONSTRAINTS,
  isEntitlementEligibleForSession,
  paidAcquisitionIdempotencyKey,
} from "@balanse/domain";
import { requireCustomer, resolveActor, writeAudit } from "../auth";
import {
  entitlementWithLedger,
  presentAcquisition,
  presentEntitlement,
  presentPublicPackage,
} from "../bundle-presenters";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";
import { PAYMENT_PROOF_MAX_BYTES, PAYMENT_PROOF_MIME } from "../presenters";
import { fieldError, throwFields } from "../validation";

const publishedInclude = { classApplicability: true } as const;

function idempotencyFrom(req: Request, body: Record<string, unknown>, fallback: string): string {
  const header = req.headers.get("idempotency-key")?.trim();
  const fromBody = asString(body.idempotencyKey)?.trim();
  return header || fromBody || fallback;
}

export async function getPublicPackages(deps: ApiDeps): Promise<Response> {
  const rows = await deps.prisma.bundle.findMany({
    where: { status: "PUBLISHED" },
    include: publishedInclude,
    orderBy: { name: "asc" },
  });
  return ok({ items: rows.map(presentPublicPackage) });
}

export async function getPublicPackage(deps: ApiDeps, slug: string): Promise<Response> {
  const row = await deps.prisma.bundle.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: publishedInclude,
  });
  if (!row) throw new ApiError(404, "package_not_found", "Package not found.");
  return ok({ package: presentPublicPackage(row) });
}

export async function getMyPackages(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const [entitlements, pending] = await Promise.all([
    deps.prisma.customerBundle.findMany({
      where: { profileId: actor.userId },
      include: entitlementWithLedger,
      orderBy: { createdAt: "desc" },
    }),
    deps.prisma.bundleAcquisition.findMany({
      where: {
        profileId: actor.userId,
        status: { in: ["PENDING_PAYMENT", "PENDING_REVIEW"] },
      },
      include: { payment: true, entitlement: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return ok({
    items: entitlements.map(presentEntitlement),
    pendingAcquisitions: pending.map(presentAcquisition),
  });
}

export async function getMyPackage(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const row = await deps.prisma.customerBundle.findUnique({
    where: { id },
    include: entitlementWithLedger,
  });
  if (!row || row.profileId !== actor.userId) {
    throw new ApiError(404, "entitlement_not_found", "Package not found.");
  }
  return ok({ entitlement: presentEntitlement(row) });
}

export async function getMyPackageRedemptions(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const row = await deps.prisma.customerBundle.findUnique({
    where: { id },
    include: entitlementWithLedger,
  });
  if (!row || row.profileId !== actor.userId) {
    throw new ApiError(404, "entitlement_not_found", "Package not found.");
  }
  return ok({ items: presentEntitlement(row).redemptions ?? [] });
}

export async function getEligiblePackages(
  deps: ApiDeps,
  req: Request,
  sessionId: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const session = await deps.prisma.gymSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const rows = await deps.prisma.customerBundle.findMany({
    where: { profileId: actor.userId, status: "ACTIVE" },
    include: entitlementWithLedger,
  });
  const now = deps.now().toISOString();
  const items = rows
    .map(presentEntitlement)
    .filter(
      (item) =>
        isEntitlementEligibleForSession(
          item,
          { classId: session.classId, startsAt: session.startsAt.toISOString() },
          actor.userId,
          now,
        ).ok,
    );
  return ok({ items, sessionId });
}

async function loadPublishedBundle(deps: ApiDeps, bundleId: string) {
  const bundle = await deps.prisma.bundle.findUnique({
    where: { id: bundleId },
    include: publishedInclude,
  });
  if (!bundle) {
    throw new ApiError(404, "package_not_found", "Published package not found.", {
      fieldErrors: [fieldError("bundleId", "package_not_published", "Package is not claimable.")],
    });
  }
  if (bundle.status !== "PUBLISHED") {
    throw new ApiError(404, "package_not_found", "Published package not found.", {
      fieldErrors: [fieldError("bundleId", "package_not_published", "Package is not claimable.")],
    });
  }
  return bundle;
}

async function countApproved(deps: ApiDeps, profileId: string, bundleId: string): Promise<number> {
  return deps.prisma.bundleAcquisition.count({
    where: { profileId, bundleId, status: "APPROVED" },
  });
}

export async function postClaimPackage(
  deps: ApiDeps,
  req: Request,
  bundleId: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const bundle = await loadPublishedBundle(deps, bundleId);
  if (Number(bundle.pricePhp) > 0) {
    throw new ApiError(400, "package_not_free", "This package requires payment review.");
  }
  const key = idempotencyFrom(req, body, claimIdempotencyKey(actor.userId, bundleId));
  const existing = await deps.prisma.bundleAcquisition.findUnique({
    where: { idempotencyKey: key },
    include: { payment: true, entitlement: { include: entitlementWithLedger } },
  });
  if (existing) {
    return ok({
      acquisition: presentAcquisition(existing),
      entitlement: existing.entitlement ? presentEntitlement(existing.entitlement) : null,
      replayed: true,
    });
  }
  const used = await countApproved(deps, actor.userId, bundleId);
  if (bundle.perCustomerLimit != null && used >= bundle.perCustomerLimit) {
    throwFields(
      fieldError(
        "bundleId",
        "acquisition_limit_reached",
        "This customer already has the allowed number of this package.",
      ),
    );
  }
  const created = await issueEntitlement(deps, {
    bundle,
    profileId: actor.userId,
    kind: "CUSTOMER_CLAIM",
    status: "APPROVED",
    idempotencyKey: key,
    actorStaffId: null,
  });
  await writeAudit(deps, {
    entityType: "customer_bundle",
    entityId: created.entitlement.id,
    action: "bundle.claim",
    actor,
    metadata: { bundleId, acquisitionId: created.acquisition.id },
  });
  return ok({
    acquisition: presentAcquisition(created.acquisition),
    entitlement: presentEntitlement(created.entitlement),
    replayed: false,
  });
}

export async function postPaidAcquisition(
  deps: ApiDeps,
  req: Request,
  bundleId: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const bundle = await loadPublishedBundle(deps, bundleId);
  if (Number(bundle.pricePhp) <= 0) {
    throw new ApiError(400, "package_is_free", "Claim this free package instead of paying.");
  }
  const key = idempotencyFrom(req, body, paidAcquisitionIdempotencyKey(actor.userId, bundleId));
  const existing = await deps.prisma.bundleAcquisition.findUnique({
    where: { idempotencyKey: key },
    include: { payment: true, entitlement: true },
  });
  if (existing) {
    return ok({ acquisition: presentAcquisition(existing), replayed: true });
  }
  const pending = await deps.prisma.bundleAcquisition.findFirst({
    where: {
      profileId: actor.userId,
      bundleId,
      status: { in: ["PENDING_PAYMENT", "PENDING_REVIEW"] },
    },
    include: { payment: true, entitlement: true },
  });
  if (pending) {
    return ok({ acquisition: presentAcquisition(pending), replayed: true });
  }
  const used = await countApproved(deps, actor.userId, bundleId);
  if (bundle.perCustomerLimit != null && used >= bundle.perCustomerLimit) {
    throwFields(
      fieldError(
        "bundleId",
        "acquisition_limit_reached",
        "This customer already has the allowed number of this package.",
      ),
    );
  }
  const acquisition = await deps.prisma.bundleAcquisition.create({
    data: {
      bundleId,
      profileId: actor.userId,
      kind: "CUSTOMER_PAID",
      status: "PENDING_PAYMENT",
      idempotencyKey: key,
    },
    include: { payment: true, entitlement: true },
  });
  await writeAudit(deps, {
    entityType: "bundle_acquisition",
    entityId: acquisition.id,
    action: "bundle.acquire.request",
    actor,
    metadata: { bundleId },
  });
  return ok({ acquisition: presentAcquisition(acquisition), replayed: false });
}

export async function postAcquisitionPaymentMethod(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const method = asString(body.method);
  if (method !== "GCASH" && method !== "PAY_AT_COUNTER") {
    throw new ApiError(400, "validation_error", "method must be GCASH or PAY_AT_COUNTER.", {
      fields: { method: "Must be GCASH or PAY_AT_COUNTER." },
    });
  }
  const acquisition = await deps.prisma.bundleAcquisition.findUnique({
    where: { id },
    include: { payment: true, bundle: true, entitlement: true },
  });
  if (!acquisition || acquisition.profileId !== actor.userId) {
    throw new ApiError(404, "acquisition_not_found", "Acquisition not found.");
  }
  if (acquisition.kind !== "CUSTOMER_PAID") {
    throw new ApiError(
      400,
      "not_paid_acquisition",
      "Only paid package requests take a payment method.",
    );
  }
  const amount = acquisition.bundle.pricePhp;
  const payment = acquisition.payment
    ? await deps.prisma.bundleAcquisitionPayment.update({
        where: { id: acquisition.payment.id },
        data: { method },
      })
    : await deps.prisma.bundleAcquisitionPayment.create({
        data: { acquisitionId: acquisition.id, method, status: "NONE", amount },
      });
  const refreshed = await deps.prisma.bundleAcquisition.findUniqueOrThrow({
    where: { id },
    include: { payment: true, entitlement: true },
  });
  await writeAudit(deps, {
    entityType: "bundle_acquisition",
    entityId: id,
    action: "bundle.payment.method",
    actor,
    metadata: { method, paymentId: payment.id },
  });
  return ok({ acquisition: presentAcquisition(refreshed) });
}

export async function postAcquisitionPaymentProof(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const acquisition = await deps.prisma.bundleAcquisition.findUnique({
    where: { id },
    include: { payment: true, entitlement: true },
  });
  if (!acquisition || acquisition.profileId !== actor.userId) {
    throw new ApiError(404, "acquisition_not_found", "Acquisition not found.");
  }
  const body = await readJson(req);
  const objectKey = asString(body.objectKey);
  const contentType = asString(body.contentType);
  if (!objectKey) {
    if (!contentType || !PAYMENT_PROOF_MIME.has(contentType)) {
      throw new ApiError(
        400,
        "invalid_mime",
        "Only jpeg, png, webp, and heic proofs are accepted.",
      );
    }
    const size = typeof body.byteSize === "number" ? body.byteSize : undefined;
    if (size !== undefined && size > PAYMENT_PROOF_MAX_BYTES) {
      throw new ApiError(400, "file_too_large", "Proof must be 5 MiB or smaller.");
    }
    throw new ApiError(
      400,
      "object_key_required",
      "Upload the proof first, then submit objectKey.",
    );
  }
  if (!acquisition.payment) {
    throw new ApiError(400, "payment_method_required", "Choose a payment method first.");
  }
  if (acquisition.payment.method !== "GCASH") {
    throw new ApiError(
      400,
      "cash_does_not_use_proof",
      "Pay at Counter does not use proof uploads.",
    );
  }
  await deps.prisma.bundleAcquisitionPayment.update({
    where: { id: acquisition.payment.id },
    data: {
      proofObjectKey: objectKey,
      submittedAt: deps.now(),
      status: "PROOF_SUBMITTED",
    },
  });
  const refreshed = await deps.prisma.bundleAcquisition.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
    include: { payment: true, entitlement: true },
  });
  await writeAudit(deps, {
    entityType: "bundle_acquisition",
    entityId: id,
    action: "bundle.payment.proof",
    actor,
    metadata: { objectKey },
  });
  return ok({ acquisition: presentAcquisition(refreshed) });
}

export async function issueEntitlement(
  deps: ApiDeps,
  input: {
    bundle: {
      id: string;
      name: string;
      sessionCreditCount: number;
      pricePhp: unknown;
      applicabilityMode: "ALL_ACTIVE_CLASSES" | "EXPLICIT_CLASSES";
      validityDays: number | null;
      classApplicability?: Array<{ classId: string }>;
    };
    profileId: string;
    kind: "CUSTOMER_CLAIM" | "CUSTOMER_PAID" | "ADMIN_GRANT";
    status: "APPROVED";
    idempotencyKey: string;
    actorStaffId: string | null;
    adminNote?: string | null;
    overrideLimit?: boolean;
    overrideReason?: string | null;
  },
) {
  const expiresAt =
    input.bundle.validityDays != null
      ? new Date(deps.now().getTime() + input.bundle.validityDays * 24 * 60 * 60 * 1000)
      : null;
  const acquisition = await deps.prisma.bundleAcquisition.create({
    data: {
      bundleId: input.bundle.id,
      profileId: input.profileId,
      kind: input.kind,
      status: input.status,
      idempotencyKey: input.idempotencyKey,
      adminNote: input.adminNote ?? null,
      overrideLimit: input.overrideLimit ?? false,
      overrideReason: input.overrideReason ?? null,
      grantedById: input.kind === "ADMIN_GRANT" ? input.actorStaffId : null,
      reviewedById: input.actorStaffId,
      reviewedAt: input.actorStaffId ? deps.now() : null,
    },
  });
  const entitlement = await deps.prisma.customerBundle.create({
    data: {
      acquisitionId: acquisition.id,
      bundleId: input.bundle.id,
      profileId: input.profileId,
      status: "ACTIVE",
      snapshotName: input.bundle.name,
      snapshotSessionCreditCount: input.bundle.sessionCreditCount,
      snapshotPricePhp: input.bundle.pricePhp as never,
      snapshotApplicabilityMode: input.bundle.applicabilityMode,
      snapshotClassIds: (input.bundle.classApplicability ?? []).map((item) => item.classId),
      snapshotValidityDays: input.bundle.validityDays,
      snapshotExpiresAt: expiresAt,
    },
    include: entitlementWithLedger,
  });
  const fullAcquisition = await deps.prisma.bundleAcquisition.findUniqueOrThrow({
    where: { id: acquisition.id },
    include: { payment: true, entitlement: true },
  });
  void FIELD_CONSTRAINTS;
  return { acquisition: fullAcquisition, entitlement };
}
