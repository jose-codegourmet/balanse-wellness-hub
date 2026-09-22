import { type BundleApplicabilityMode, bundleSlug, FIELD_CONSTRAINTS } from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import {
  entitlementWithLedger,
  presentAcquisition,
  presentAdminBundle,
  presentEntitlement,
} from "../bundle-presenters";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson, searchParams } from "../http";
import {
  fieldError,
  intValue,
  moneyValue,
  optionalString,
  requireString,
  throwFields,
} from "../validation";
import { issueEntitlement } from "./packages";

const bundleInclude = { classApplicability: true } as const;

function readApplicability(body: Record<string, unknown>): {
  mode: BundleApplicabilityMode;
  classIds: string[];
} {
  const mode = asString(body.applicabilityMode);
  if (mode !== "ALL_ACTIVE_CLASSES" && mode !== "EXPLICIT_CLASSES") {
    throwFields(
      fieldError(
        "applicabilityMode",
        "invalid_enum",
        "Must be ALL_ACTIVE_CLASSES or EXPLICIT_CLASSES.",
      ),
    );
  }
  const classIds = Array.isArray(body.classIds)
    ? body.classIds.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
  if (mode === "EXPLICIT_CLASSES" && classIds.length === 0) {
    throwFields(
      fieldError(
        "classIds",
        "explicit_classes_required",
        "Choose at least one class for this package.",
      ),
    );
  }
  return { mode, classIds: mode === "ALL_ACTIVE_CLASSES" ? [] : classIds };
}

async function loadBundle(deps: ApiDeps, id: string) {
  const row = await deps.prisma.bundle.findUnique({ where: { id }, include: bundleInclude });
  if (!row) throw new ApiError(404, "package_not_found", "Bundle not found.");
  return row;
}

export async function getAdminBundles(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const status = searchParams(req).get("status");
  const rows = await deps.prisma.bundle.findMany({
    where: status ? { status: status as never } : undefined,
    include: bundleInclude,
    orderBy: { name: "asc" },
  });
  return ok({ items: rows.map(presentAdminBundle) });
}

export async function getAdminBundle(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  return ok({ bundle: presentAdminBundle(await loadBundle(deps, id)) });
}

export async function postAdminBundle(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = requireString(body, "name", FIELD_CONSTRAINTS.bundle.name.max);
  const summary = requireString(body, "summary", FIELD_CONSTRAINTS.bundle.summary.max);
  const description = requireString(body, "description", FIELD_CONSTRAINTS.bundle.description.max);
  const sessionCreditCount = intValue(body, "sessionCreditCount", 1, 500, true);
  const pricePhp = moneyValue(body, "pricePhp", true);
  const slug = optionalString(body, "slug", FIELD_CONSTRAINTS.bundle.slug.max) ?? bundleSlug(name);
  const validityDays = intValue(body, "validityDays", 1, 3650, false);
  const perCustomerLimit = intValue(body, "perCustomerLimit", 1, 20, false);
  const { mode, classIds } = readApplicability(body);
  const created = await deps.prisma.bundle.create({
    data: {
      name,
      slug,
      summary,
      description,
      sessionCreditCount: sessionCreditCount as number,
      pricePhp: pricePhp as string,
      applicabilityMode: mode,
      validityDays: validityDays === undefined ? null : validityDays,
      perCustomerLimit: perCustomerLimit === undefined ? null : perCustomerLimit,
      status: "DRAFT",
      classApplicability: {
        create: classIds.map((classId) => ({ classId })),
      },
    },
    include: bundleInclude,
  });
  await writeAudit(deps, {
    entityType: "bundle",
    entityId: created.id,
    action: "bundle.create",
    actor,
  });
  return ok({ bundle: presentAdminBundle(created) });
}

export async function patchAdminBundle(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await loadBundle(deps, id);
  const body = await readJson(req);
  const name = optionalString(body, "name", FIELD_CONSTRAINTS.bundle.name.max);
  const summary = optionalString(body, "summary", FIELD_CONSTRAINTS.bundle.summary.max);
  const description = optionalString(body, "description", FIELD_CONSTRAINTS.bundle.description.max);
  const sessionCreditCount = intValue(body, "sessionCreditCount", 1, 500, false);
  const pricePhp = moneyValue(body, "pricePhp", false);
  const slug = optionalString(body, "slug", FIELD_CONSTRAINTS.bundle.slug.max);
  const validityDays = intValue(body, "validityDays", 1, 3650, false);
  const perCustomerLimit = intValue(body, "perCustomerLimit", 1, 20, false);
  const applicability = "applicabilityMode" in body ? readApplicability(body) : null;
  const updated = await deps.prisma.$transaction(async (tx) => {
    if (applicability) {
      await tx.bundleClassApplicability.deleteMany({ where: { bundleId: id } });
      if (applicability.classIds.length) {
        await tx.bundleClassApplicability.createMany({
          data: applicability.classIds.map((classId) => ({ bundleId: id, classId })),
        });
      }
    }
    return tx.bundle.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(sessionCreditCount !== undefined && sessionCreditCount !== null
          ? { sessionCreditCount }
          : {}),
        ...(pricePhp !== undefined && pricePhp !== null ? { pricePhp } : {}),
        ...(validityDays !== undefined ? { validityDays } : {}),
        ...(perCustomerLimit !== undefined ? { perCustomerLimit } : {}),
        ...(applicability ? { applicabilityMode: applicability.mode } : {}),
      },
      include: bundleInclude,
    });
  });
  await writeAudit(deps, {
    entityType: "bundle",
    entityId: id,
    action: "bundle.update",
    actor,
    metadata: { previousStatus: existing.status },
  });
  return ok({ bundle: presentAdminBundle(updated) });
}

async function setBundleStatus(
  deps: ApiDeps,
  req: Request,
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  action: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await loadBundle(deps, id);
  const updated = await deps.prisma.bundle.update({
    where: { id },
    data: { status },
    include: bundleInclude,
  });
  await writeAudit(deps, {
    entityType: "bundle",
    entityId: id,
    action,
    actor,
    beforeStatus: existing.status,
    afterStatus: status,
  });
  return ok({ bundle: presentAdminBundle(updated) });
}

export async function postPublishBundle(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  return setBundleStatus(deps, req, id, "PUBLISHED", "bundle.publish");
}

export async function postUnpublishBundle(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  return setBundleStatus(deps, req, id, "DRAFT", "bundle.unpublish");
}

export async function postArchiveBundle(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  return setBundleStatus(deps, req, id, "ARCHIVED", "bundle.archive");
}

export async function getAdminCustomerPackages(
  deps: ApiDeps,
  req: Request,
  customerId: string,
): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const [entitlements, acquisitions] = await Promise.all([
    deps.prisma.customerBundle.findMany({
      where: { profileId: customerId },
      include: entitlementWithLedger,
      orderBy: { createdAt: "desc" },
    }),
    deps.prisma.bundleAcquisition.findMany({
      where: { profileId: customerId },
      include: { payment: true, entitlement: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return ok({
    items: entitlements.map(presentEntitlement),
    acquisitions: acquisitions.map(presentAcquisition),
  });
}

export async function postGrantPackage(
  deps: ApiDeps,
  req: Request,
  customerId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const bundleId = requireString(body, "bundleId", 64);
  const adminNote = optionalString(body, "adminNote", FIELD_CONSTRAINTS.bundle.adminNote.max);
  const overrideLimit = body.overrideLimit === true;
  const overrideReason = optionalString(
    body,
    "overrideReason",
    FIELD_CONSTRAINTS.bundle.overrideReason.max,
  );
  const bundle = await deps.prisma.bundle.findUnique({
    where: { id: bundleId },
    include: bundleInclude,
  });
  if (!bundle) {
    throwFields(
      fieldError("bundleId", "package_not_published", "Only published packages can be granted."),
    );
  }
  if (bundle.status !== "PUBLISHED") {
    throwFields(
      fieldError("bundleId", "package_not_published", "Only published packages can be granted."),
    );
  }
  const profile = await deps.prisma.profile.findUnique({ where: { id: customerId } });
  if (!profile) throw new ApiError(404, "customer_not_found", "Customer not found.");
  const used = await deps.prisma.bundleAcquisition.count({
    where: { profileId: customerId, bundleId, status: "APPROVED" },
  });
  if (bundle.perCustomerLimit != null && used >= bundle.perCustomerLimit && !overrideLimit) {
    throwFields(
      fieldError(
        "overrideLimit",
        "acquisition_limit_reached",
        "Granting again requires an explicit override reason.",
      ),
    );
  }
  if (overrideLimit && !overrideReason) {
    throwFields(fieldError("overrideReason", "required", "Override reason is required."));
  }
  const key =
    asString(body.idempotencyKey)?.trim() ||
    req.headers.get("idempotency-key")?.trim() ||
    `admin-grant:${customerId}:${bundleId}:${used}`;
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
  const created = await issueEntitlement(deps, {
    bundle,
    profileId: customerId,
    kind: "ADMIN_GRANT",
    status: "APPROVED",
    idempotencyKey: key,
    actorStaffId: actor.staffId,
    adminNote,
    overrideLimit,
    overrideReason,
  });
  await writeAudit(deps, {
    entityType: "customer_bundle",
    entityId: created.entitlement.id,
    action: "bundle.grant",
    actor,
    metadata: {
      customerId,
      bundleId,
      overrideLimit,
      overrideReason,
      note: adminNote,
    },
  });
  return ok({
    acquisition: presentAcquisition(created.acquisition),
    entitlement: presentEntitlement(created.entitlement),
    replayed: false,
  });
}

export async function postRevokePackage(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const reason = requireString(body, "reason", FIELD_CONSTRAINTS.bundle.revokeReason.max);
  const existing = await deps.prisma.customerBundle.findUnique({
    where: { id },
    include: entitlementWithLedger,
  });
  if (!existing) throw new ApiError(404, "entitlement_not_found", "Entitlement not found.");
  const updated = await deps.prisma.customerBundle.update({
    where: { id },
    data: {
      status: "REVOKED",
      revokedAt: deps.now(),
      revokedById: actor.staffId,
      revokeReason: reason,
    },
    include: entitlementWithLedger,
  });
  await writeAudit(deps, {
    entityType: "customer_bundle",
    entityId: id,
    action: "bundle.revoke",
    actor,
    beforeStatus: existing.status,
    afterStatus: "REVOKED",
    metadata: { reason, customerId: existing.profileId },
  });
  return ok({ entitlement: presentEntitlement(updated) });
}

export async function getAdminAcquisitions(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const status = searchParams(req).get("status");
  const rows = await deps.prisma.bundleAcquisition.findMany({
    where: status ? { status: status as never } : undefined,
    include: { payment: true, entitlement: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok({ items: rows.map(presentAcquisition) });
}

export async function postApproveAcquisition(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const acquisition = await deps.prisma.bundleAcquisition.findUnique({
    where: { id },
    include: { bundle: { include: bundleInclude }, payment: true, entitlement: true },
  });
  if (!acquisition) throw new ApiError(404, "acquisition_not_found", "Acquisition not found.");
  if (acquisition.entitlement) {
    const entitlement = await deps.prisma.customerBundle.findUniqueOrThrow({
      where: { id: acquisition.entitlement.id },
      include: entitlementWithLedger,
    });
    return ok({
      acquisition: presentAcquisition(acquisition),
      entitlement: presentEntitlement(entitlement),
      replayed: true,
    });
  }
  if (acquisition.kind !== "CUSTOMER_PAID") {
    throw new ApiError(400, "not_paid_acquisition", "Only paid requests are approved here.");
  }
  const entitlement = await deps.prisma.$transaction(async (tx) => {
    await tx.bundleAcquisition.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedById: actor.staffId,
        reviewedAt: deps.now(),
      },
    });
    if (acquisition.payment) {
      await tx.bundleAcquisitionPayment.update({
        where: { id: acquisition.payment.id },
        data: {
          status: acquisition.payment.method === "PAY_AT_COUNTER" ? "CASH_RECEIVED" : "VERIFIED",
          reviewedById: actor.staffId,
          reviewedAt: deps.now(),
        },
      });
    }
    const expiresAt =
      acquisition.bundle.validityDays != null
        ? new Date(deps.now().getTime() + acquisition.bundle.validityDays * 24 * 60 * 60 * 1000)
        : null;
    return tx.customerBundle.create({
      data: {
        acquisitionId: id,
        bundleId: acquisition.bundleId,
        profileId: acquisition.profileId,
        status: "ACTIVE",
        snapshotName: acquisition.bundle.name,
        snapshotSessionCreditCount: acquisition.bundle.sessionCreditCount,
        snapshotPricePhp: acquisition.bundle.pricePhp,
        snapshotApplicabilityMode: acquisition.bundle.applicabilityMode,
        snapshotClassIds: acquisition.bundle.classApplicability.map((item) => item.classId),
        snapshotValidityDays: acquisition.bundle.validityDays,
        snapshotExpiresAt: expiresAt,
      },
      include: entitlementWithLedger,
    });
  });
  await writeAudit(deps, {
    entityType: "bundle_acquisition",
    entityId: id,
    action: "bundle.acquire.approve",
    actor,
    metadata: { entitlementId: entitlement.id, customerId: acquisition.profileId },
  });
  const refreshed = await deps.prisma.bundleAcquisition.findUniqueOrThrow({
    where: { id },
    include: { payment: true, entitlement: true },
  });
  return ok({
    acquisition: presentAcquisition(refreshed),
    entitlement: presentEntitlement(entitlement),
    replayed: false,
  });
}

export async function postRejectAcquisition(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const note = requireString(body, "reason", 500);
  const acquisition = await deps.prisma.bundleAcquisition.findUnique({
    where: { id },
    include: { payment: true, entitlement: true },
  });
  if (!acquisition) throw new ApiError(404, "acquisition_not_found", "Acquisition not found.");
  if (acquisition.entitlement) {
    throw new ApiError(409, "already_activated", "An approved entitlement cannot be rejected.");
  }
  const updated = await deps.prisma.bundleAcquisition.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionNote: note,
      reviewedById: actor.staffId,
      reviewedAt: deps.now(),
    },
    include: { payment: true, entitlement: true },
  });
  if (updated.payment) {
    await deps.prisma.bundleAcquisitionPayment.update({
      where: { id: updated.payment.id },
      data: { status: "REJECTED", reviewedById: actor.staffId, reviewedAt: deps.now() },
    });
  }
  await writeAudit(deps, {
    entityType: "bundle_acquisition",
    entityId: id,
    action: "bundle.acquire.reject",
    actor,
    metadata: { reason: note, customerId: acquisition.profileId },
  });
  const refreshed = await deps.prisma.bundleAcquisition.findUniqueOrThrow({
    where: { id },
    include: { payment: true, entitlement: true },
  });
  return ok({ acquisition: presentAcquisition(refreshed) });
}

export async function getAdminEntitlementRedemptions(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const row = await deps.prisma.customerBundle.findUnique({
    where: { id },
    include: entitlementWithLedger,
  });
  if (!row) throw new ApiError(404, "entitlement_not_found", "Entitlement not found.");
  return ok({ entitlement: presentEntitlement(row), items: presentEntitlement(row).redemptions });
}
