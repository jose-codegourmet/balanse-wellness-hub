import { randomUUID } from "node:crypto";
import {
  FIELD_CONSTRAINTS,
  type SettingsSection,
  SIGNED_UPLOAD,
  validatePaymentAccount,
} from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson, searchParams } from "../http";
import {
  assertNotLastVisibleAccount,
  createPaymentAccount,
  getOwnedPaymentQr,
  listActivePaymentQrs,
  listPaymentQrs,
  overlayDerivedQr,
  persistDerivedQr,
  setPaymentQrActive,
} from "../payment-qrs";
import { presentPaymentQr } from "../presenters";
import { requireSettingsSection, shapeSettingsPayload } from "../sensitive";
import {
  assertNoDeveloperConfig,
  mergeSettings,
  readSettings,
  type SettingsPayload,
  writeSettings,
} from "../settings";
import { confirmUpload, extensionFor, mintSignedUpload } from "../uploads";
import {
  fieldError,
  optionalString,
  requireEmail,
  requirePhMobile,
  requirePolicyVersion,
  requireString,
  throwFields,
} from "../validation";

const POLICY_FORMS = [
  "sign_up",
  "booking",
  "package_request",
  "payment_proof",
  "reschedule",
  "cancellation",
  "contact",
] as const;
type PolicyForm = (typeof POLICY_FORMS)[number];
const PRISMA_POLICY_FORM: Record<
  PolicyForm,
  | "SIGN_UP"
  | "BOOKING"
  | "PACKAGE_REQUEST"
  | "PAYMENT_PROOF"
  | "RESCHEDULE"
  | "CANCELLATION"
  | "CONTACT"
> = {
  sign_up: "SIGN_UP",
  booking: "BOOKING",
  package_request: "PACKAGE_REQUEST",
  payment_proof: "PAYMENT_PROOF",
  reschedule: "RESCHEDULE",
  cancellation: "CANCELLATION",
  contact: "CONTACT",
};

async function policyRequirements(deps: ApiDeps) {
  const rows = await deps.prisma.policyFormRequirement.findMany({
    include: { document: true },
    orderBy: [{ form: "asc" }, { sortOrder: "asc" }],
  });
  return Object.fromEntries(
    POLICY_FORMS.map((form) => [
      form,
      rows.filter((row) => row.form === PRISMA_POLICY_FORM[form]).map((row) => row.document.title),
    ]),
  );
}

export async function getAdminSettings(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  return ok(shapeSettingsPayload(actor, await settingsPayload(deps)));
}

async function settingsPayload(deps: ApiDeps) {
  const settings = await overlayDerivedQr(deps, await readSettings(deps));
  const [faqs, paymentQrs] = await Promise.all([
    deps.prisma.faqItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    listPaymentQrs(deps, false),
  ]);
  const [policies, policyFormRequirements] = await Promise.all([
    deps.prisma.policyDocument.findMany({
      include: { versions: { orderBy: { createdAt: "desc" } } },
      orderBy: { title: "asc" },
    }),
    policyRequirements(deps),
  ]);
  const body = {
    section: {
      business: ["business.name", "contact.phone", "contact.address"],
      payment: ["gcashAccountName", "gcashNumber", "gcashQrObjectKey (read-only derived)"],
      content: ["about", "contact.email", "faqs"],
      policies: ["promote"],
    },
    business: {
      name: settings.business.name,
      phone: settings.business.phone,
      address: settings.business.address,
      openingHours: settings.business.openingHours,
    },
    payment: {
      ...settings.payment,
      qrImageKey: settings.payment.gcashQrObjectKey || null,
      qrs: paymentQrs.map(presentPaymentQr),
    },
    content: {
      about: settings.content.about,
      email: settings.business.email,
      faqs: faqs.map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        sortOrder: row.sortOrder,
      })),
    },
    policies: policies.map((doc) => ({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      kind: doc.kind,
      required: doc.required,
      current: doc.versions.find((version) => version.isCurrent) ?? null,
      versions: doc.versions.map((version) => ({
        id: version.id,
        version: version.version,
        title: version.title,
        body: version.body,
        isCurrent: version.isCurrent,
        isPlaceholder: version.isPlaceholder,
        effectiveFrom: version.effectiveFrom.toISOString(),
      })),
    })),
    // Compatibility shape for the current Settings composition. The API client
    // normalizes this into `AdminSettings` while policy routes remain grouped
    // by document above.
    policyDocuments: policies.flatMap((doc) =>
      doc.versions.map((version) => ({
        id: version.id,
        documentId: doc.id,
        documentName: doc.title,
        version: version.version,
        promotedAt: version.effectiveFrom.toISOString(),
        current: version.isCurrent,
        body: version.body,
      })),
    ),
    policyFormRequirements,
  };
  assertNoDeveloperConfig(body);
  return body;
}

export async function patchAdminSettings(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  assertNoDeveloperConfig(body);
  const section = (asString(body.section) ?? inferSection(body)) as SettingsSection | undefined;
  if (section) requireSettingsSection(actor, section);
  else {
    if (
      hasPath(body, "business") ||
      hasPath(body, "business.name") ||
      hasPath(body, "business.phone")
    ) {
      requireSettingsSection(actor, "business");
    }
    if (hasPath(body, "payment")) requireSettingsSection(actor, "payment");
    if (hasPath(body, "content") || hasPath(body, "business.email")) {
      requireSettingsSection(actor, "content");
    }
  }
  if (section && !["business", "payment", "content", "policies"].includes(section)) {
    throwFields(
      fieldError(
        "section",
        "unknown_section",
        "section must be business, payment, content, or policies.",
      ),
    );
  }
  if (hasPath(body, "openingHours") || hasPath(body, "business.openingHours")) {
    throwFields(fieldError("openingHours", "read_only", "openingHours is read-only."));
  }

  const current = await readSettings(deps);
  const next: SettingsPayload = mergeSettings(current);
  const changed: string[] = [];

  if (!section || section === "business") {
    const name = optionalString(body, "business.name", FIELD_CONSTRAINTS.settings.businessName.max);
    const phone = optionalString(
      body,
      "business.phone",
      FIELD_CONSTRAINTS.settings["contact.phone"].max,
    );
    const address = optionalString(
      body,
      "business.address",
      FIELD_CONSTRAINTS.settings["contact.address"].max,
    );
    if (name !== undefined) {
      next.business.name = name;
      changed.push("business.name");
    }
    if (phone !== undefined) {
      if (phone) requirePhMobile({ business: { phone } }, "business.phone");
      next.business.phone = phone;
      changed.push("contact.phone");
    }
    if (address !== undefined) {
      next.business.address = address;
      changed.push("contact.address");
    }
  }

  if (!section || section === "payment") {
    const gcashName =
      optionalString(body, "payment.gcashAccountName", FIELD_CONSTRAINTS.settings.gcashName.max) ??
      optionalString(body, "payment.gcashName", FIELD_CONSTRAINTS.settings.gcashName.max);
    const gcashNumberRaw = optionalString(body, "payment.gcashNumber", 16);
    if (gcashName !== undefined) {
      next.payment.gcashAccountName = gcashName;
      changed.push("gcashName");
    }
    if (gcashNumberRaw !== undefined) {
      if (gcashNumberRaw) {
        requirePhMobile({ payment: { gcashNumber: gcashNumberRaw } }, "payment.gcashNumber");
      }
      next.payment.gcashNumber = gcashNumberRaw;
      changed.push("gcashNumber");
    }
    if (
      hasPath(body, "payment.gcashQrObjectKey") ||
      hasPath(body, "payment.qrImageKey") ||
      hasPath(body, "qrImageKey")
    ) {
      throwFields(
        fieldError(
          "payment.gcashQrObjectKey",
          "read_only",
          "qrImageKey is derived from the active payment QR. Use /api/admin/settings/payment-qrs.",
        ),
      );
    }
  }

  if (!section || section === "content") {
    const about = optionalString(body, "content.about", FIELD_CONSTRAINTS.settings.about.max);
    const email =
      optionalString(body, "content.email", FIELD_CONSTRAINTS.settings["contact.email"].max) ??
      optionalString(body, "business.email", FIELD_CONSTRAINTS.settings["contact.email"].max);
    if (about !== undefined) {
      next.content.about = about;
      changed.push("about");
    }
    if (email !== undefined) {
      requireEmail({ content: { email } }, "content.email");
      next.business.email = email;
      changed.push("contact.email");
    }
  }

  if (section === "policies") {
    throw new ApiError(
      400,
      "use_promote_endpoint",
      "Promote a policy with POST /api/admin/settings/policies/{id}/promote.",
    );
  }

  await writeSettings(deps, next);
  await writeAudit(deps, {
    entityType: "settings",
    entityId: "public_settings",
    action: "settings.update",
    actor,
    metadata: { section: section ?? "partial", changedKeys: changed },
  });
  return ok(shapeSettingsPayload(actor, await settingsPayload(deps)));
}

/**
 * @deprecated legacy single-slot GCash uploader for the general settings
 * page's "payment" section. Behaves like it always has (replace the one
 * shown GCash QR) on top of the WIRE-1701 multi-account table: confirming a
 * new image here hides every other currently-shown account and shows only
 * the new one, approximating the old "exactly one active" model for this
 * one legacy entry point. The full collection (`/payment-qrs`) does not
 * share this restriction.
 */
export async function postSettingsQr(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType)
      throwFields(fieldError("contentType", "required", "contentType is required."));
    const path = `marketing-assets/settings/gcash-qr/${randomUUID()}.${extensionFor(contentType)}`;
    return ok(
      await mintSignedUpload(deps, actor, {
        bucket: "marketing-assets",
        purpose: "gcash_qr",
        entityId: "public_settings",
        contentType,
        allowed: new Set(SIGNED_UPLOAD.gcashQrTypes),
        objectKey: path,
      }),
    );
  }
  await confirmUpload(deps, objectKey);
  const label =
    optionalString(body, "label", FIELD_CONSTRAINTS.settings.paymentQr.label.max) ?? "GCash";
  const previouslyShown = await listActivePaymentQrs(deps);
  const created = await createPaymentAccount(deps, {
    type: "GCASH",
    label,
    accountName: "",
    accountNumber: "",
    imageKey: objectKey,
    isActive: true,
  });
  await deps.prisma.paymentQrCode.updateMany({
    where: { isActive: true, archivedAt: null, id: { not: created.id } },
    data: { isActive: false },
  });
  const payment = (await persistDerivedQr(deps)).payment;
  await writeAudit(deps, {
    entityType: "settings",
    entityId: "public_settings",
    action: "settings.qr.replace",
    actor,
    metadata: { previous: previouslyShown.map((row) => row.imageKey), objectKey, qrId: created.id },
  });
  return ok({
    payment,
    qr: presentPaymentQr(created),
  });
}

export async function deleteSettingsQr(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  throwFields(
    fieldError(
      "id",
      "cannot_remove_active",
      "The active receive QR cannot be removed. Activate another QR, then DELETE /api/admin/settings/payment-qrs/{id}.",
    ),
  );
}

export async function getPaymentQrs(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const includeArchived = searchParams(req).get("includeArchived") === "true";
  const items = (await listPaymentQrs(deps, includeArchived)).map(presentPaymentQr);
  return ok({ items });
}

/** Mint (no `objectKey`) or confirm (with `objectKey`) a QR image, decoupled from creating/patching the account row (WIRE-1702/#371). */
export async function postPaymentQrImage(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType)
      throwFields(fieldError("contentType", "required", "contentType is required."));
    const path = `marketing-assets/settings/payment-qrs/${randomUUID()}.${extensionFor(contentType)}`;
    return ok(
      await mintSignedUpload(deps, actor, {
        bucket: "marketing-assets",
        purpose: "gcash_qr",
        entityId: "payment_qr_codes",
        contentType,
        allowed: new Set(SIGNED_UPLOAD.gcashQrTypes),
        objectKey: path,
      }),
    );
  }
  await confirmUpload(deps, objectKey);
  return ok({ objectKey });
}

export async function postPaymentQr(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const type = asString(body.type);
  if (type !== "GCASH" && type !== "MAYA" && type !== "QRPH") {
    throwFields(fieldError("type", "invalid_enum", "type must be GCASH, MAYA, or QRPH."));
  }
  const label = requireString(body, "label", FIELD_CONSTRAINTS.settings.paymentQr.label.max);
  const accountName = requireString(
    body,
    "accountName",
    FIELD_CONSTRAINTS.settings.paymentQr.accountName.max,
  );
  const accountNumber =
    optionalString(body, "accountNumber", FIELD_CONSTRAINTS.settings.paymentQr.accountNumber.max) ??
    "";
  const imageKey = asString(body.imageKey) ?? null;
  const isActive = body.isActive !== false;
  const invalid = validatePaymentAccount({ type, label, accountName, accountNumber, imageKey });
  if (Object.keys(invalid).length > 0) {
    throwFields(
      ...Object.entries(invalid).map(([path, message]) =>
        fieldError(path, "invalid_format", message),
      ),
    );
  }
  const created = await createPaymentAccount(deps, {
    type,
    label,
    accountName,
    accountNumber,
    imageKey,
    isActive,
  });
  if (created.isActive) await persistDerivedQr(deps);
  await writeAudit(deps, {
    entityType: "payment_qr",
    entityId: created.id,
    action: "payment_qr.create",
    actor,
    metadata: { imageKey, isActive: created.isActive },
  });
  return ok({ qr: presentPaymentQr(created) });
}

export async function patchPaymentQr(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await getOwnedPaymentQr(deps, id);
  const body = await readJson(req);
  const type = asString(body.type);
  if (type !== undefined && type !== "GCASH" && type !== "MAYA" && type !== "QRPH") {
    throwFields(fieldError("type", "invalid_enum", "type must be GCASH, MAYA, or QRPH."));
  }
  const label = optionalString(body, "label", FIELD_CONSTRAINTS.settings.paymentQr.label.max);
  const accountName = optionalString(
    body,
    "accountName",
    FIELD_CONSTRAINTS.settings.paymentQr.accountName.max,
  );
  const accountNumber = optionalString(
    body,
    "accountNumber",
    FIELD_CONSTRAINTS.settings.paymentQr.accountNumber.max,
  );
  // `imageKey: null` clears the image explicitly (WIRE-1702/#371); omitting the field keeps it.
  const clearsImage = "imageKey" in body && body.imageKey === null;
  const nextImageKey = clearsImage ? null : (asString(body.imageKey) ?? undefined);
  const invalid = validatePaymentAccount({
    type: (type as "GCASH" | "MAYA" | "QRPH") ?? existing.type,
    label: label ?? existing.label,
    accountName: accountName ?? existing.accountName,
    accountNumber: accountNumber ?? existing.accountNumber,
    imageKey: nextImageKey === undefined ? existing.imageKey : nextImageKey,
  });
  if (Object.keys(invalid).length > 0) {
    throwFields(
      ...Object.entries(invalid).map(([path, message]) =>
        fieldError(path, "invalid_format", message),
      ),
    );
  }
  if (body.isActive === false && existing.isActive) {
    await assertNotLastVisibleAccount(deps, id);
  }
  const updated = await deps.prisma.paymentQrCode.update({
    where: { id },
    data: {
      ...(type !== undefined ? { type } : {}),
      ...(label !== undefined ? { label } : {}),
      ...(accountName !== undefined ? { accountName } : {}),
      ...(accountNumber !== undefined ? { accountNumber } : {}),
      ...(nextImageKey !== undefined ? { imageKey: nextImageKey } : {}),
      ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    },
  });
  await persistDerivedQr(deps);
  await writeAudit(deps, {
    entityType: "payment_qr",
    entityId: id,
    action: "payment_qr.update",
    actor,
  });
  return ok({ qr: presentPaymentQr(updated) });
}

export async function activatePaymentQrHandler(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const active = body.active !== false;
  const updated = await setPaymentQrActive(deps, id, active);
  await persistDerivedQr(deps);
  await writeAudit(deps, {
    entityType: "payment_qr",
    entityId: id,
    action: active ? "payment_qr.activate" : "payment_qr.hide",
    actor,
  });
  return ok({ qr: presentPaymentQr(updated) });
}

export async function archivePaymentQr(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await getOwnedPaymentQr(deps, id);
  if (existing.isActive) await assertNotLastVisibleAccount(deps, id);
  const archived = await deps.prisma.paymentQrCode.update({
    where: { id },
    data: { isActive: false, archivedAt: deps.now() },
  });
  await persistDerivedQr(deps);
  await writeAudit(deps, {
    entityType: "payment_qr",
    entityId: id,
    action: "payment_qr.archive",
    actor,
    metadata: { imageKeyKept: archived.imageKey },
  });
  return ok({ qr: presentPaymentQr(archived) });
}

export async function postFaq(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const count = await deps.prisma.faqItem.count();
  if (count >= FIELD_CONSTRAINTS.settings.faq.maxItems) {
    throwFields(
      fieldError("faqs", "faq_limit", `At most ${FIELD_CONSTRAINTS.settings.faq.maxItems} FAQs.`),
    );
  }
  const question = requireString(body, "question", FIELD_CONSTRAINTS.settings.faq.question.max);
  const answer = requireString(body, "answer", FIELD_CONSTRAINTS.settings.faq.answer.max);
  const last = await deps.prisma.faqItem.findFirst({ orderBy: { sortOrder: "desc" } });
  const created = await deps.prisma.faqItem.create({
    data: { question, answer, sortOrder: (last?.sortOrder ?? 0) + 10 },
  });
  await writeAudit(deps, {
    entityType: "faq",
    entityId: created.id,
    action: "faq.create",
    actor,
  });
  return ok({ faq: created });
}

export async function patchFaq(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const question = optionalString(body, "question", FIELD_CONSTRAINTS.settings.faq.question.max);
  const answer = optionalString(body, "answer", FIELD_CONSTRAINTS.settings.faq.answer.max);
  const updated = await deps.prisma.faqItem.update({
    where: { id },
    data: {
      ...(question !== undefined ? { question } : {}),
      ...(answer !== undefined ? { answer } : {}),
    },
  });
  await writeAudit(deps, { entityType: "faq", entityId: id, action: "faq.update", actor });
  return ok({ faq: updated });
}

export async function deleteFaq(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  await deps.prisma.faqItem.delete({ where: { id } });
  await writeAudit(deps, { entityType: "faq", entityId: id, action: "faq.delete", actor });
  return ok({ deleted: id });
}

export async function reorderFaqs(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const ids = body.ids;
  if (!Array.isArray(ids) || ids.some((item) => typeof item !== "string")) {
    throwFields(fieldError("ids", "invalid_type", "ids must be an ordered array of FAQ ids."));
  }
  await deps.prisma.$transaction(
    ids.map((faqId, index) =>
      deps.prisma.faqItem.update({
        where: { id: faqId },
        data: { sortOrder: (index + 1) * 10 },
      }),
    ),
  );
  await writeAudit(deps, {
    entityType: "faq",
    entityId: "faqs",
    action: "faq.reorder",
    actor,
    metadata: { ids },
  });
  const faqs = await deps.prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
  return ok({ faqs });
}

export async function promotePolicy(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const version = requirePolicyVersion(requireString(body, "version", 7));
  const title = optionalString(body, "title", 120);
  const policyBody = requireString(body, "body", 20_000);
  const document = await deps.prisma.policyDocument.findFirst({
    where: { OR: [{ id }, { slug: id }, { title: id }] },
    include: { versions: { where: { isCurrent: true } } },
  });
  if (!document) throw new ApiError(404, "policy_not_found", "Policy document not found.");
  const previous = document.versions[0]?.version ?? null;
  await deps.prisma.$transaction(async (tx) => {
    await tx.policyDocumentVersion.updateMany({
      where: { documentId: document.id },
      data: { isCurrent: false },
    });
    await tx.policyDocumentVersion.create({
      data: {
        documentId: document.id,
        version,
        title: title ?? `Version ${version}`,
        body: policyBody,
        effectiveFrom: deps.now(),
        isCurrent: true,
        isPlaceholder: false,
      },
    });
  });
  await writeAudit(deps, {
    entityType: "policy",
    entityId: document.id,
    action: "policy.promote",
    actor,
    metadata: { document: document.title, previousVersion: previous, newVersion: version },
  });
  return ok(shapeSettingsPayload(actor, await settingsPayload(deps)));
}

export async function postPolicyDocument(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const title = requireString(body, "title", 120);
  const slug = requireString(body, "slug", 120).toLowerCase();
  const kind = asString(body.kind);
  if (
    !kind ||
    !["WAIVER", "GYM_POLICY", "PARTICIPATION_RULES", "CANCELLATION_REFUND"].includes(kind)
  ) {
    throwFields(fieldError("kind", "invalid_enum", "Provide a valid policy kind."));
  }
  const version = requirePolicyVersion(requireString(body, "version", 7));
  const policyBody = requireString(body, "body", 20_000);
  const document = await deps.prisma.policyDocument.create({
    data: {
      title,
      slug,
      kind: kind as "WAIVER" | "GYM_POLICY" | "PARTICIPATION_RULES" | "CANCELLATION_REFUND",
      required: false,
      versions: {
        create: {
          version,
          title,
          body: policyBody,
          effectiveFrom: deps.now(),
          isCurrent: true,
          isPlaceholder: false,
        },
      },
    },
  });
  await writeAudit(deps, {
    entityType: "policy",
    entityId: document.id,
    action: "policy.create",
    actor,
  });
  return ok(shapeSettingsPayload(actor, await settingsPayload(deps)));
}

export async function patchPolicyDocument(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const title = optionalString(body, "title", 120);
  const kind = asString(body.kind);
  if (
    kind !== undefined &&
    !["WAIVER", "GYM_POLICY", "PARTICIPATION_RULES", "CANCELLATION_REFUND"].includes(kind)
  ) {
    throwFields(fieldError("kind", "invalid_enum", "Provide a valid policy kind."));
  }
  await deps.prisma.policyDocument.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(kind
        ? { kind: kind as "WAIVER" | "GYM_POLICY" | "PARTICIPATION_RULES" | "CANCELLATION_REFUND" }
        : {}),
    },
  });
  await writeAudit(deps, { entityType: "policy", entityId: id, action: "policy.update", actor });
  return ok(shapeSettingsPayload(actor, await settingsPayload(deps)));
}

export async function postPolicyVersion(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const version = requirePolicyVersion(requireString(body, "version", 7));
  const title = requireString(body, "title", 120);
  const policyBody = requireString(body, "body", 20_000);
  const document = await deps.prisma.policyDocument.findUnique({ where: { id } });
  if (!document) throw new ApiError(404, "policy_not_found", "Policy document not found.");
  await deps.prisma.policyDocumentVersion.create({
    data: {
      documentId: id,
      version,
      title,
      body: policyBody,
      effectiveFrom: deps.now(),
      isCurrent: false,
      isPlaceholder: false,
    },
  });
  await writeAudit(deps, {
    entityType: "policy",
    entityId: id,
    action: "policy.version.create",
    actor,
  });
  return ok(shapeSettingsPayload(actor, await settingsPayload(deps)));
}

export async function deletePolicyDocument(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const document = await deps.prisma.policyDocument.findFirst({
    where: { OR: [{ id }, { slug: id }, { title: id }] },
  });
  if (!document) throw new ApiError(404, "policy_not_found", "Policy document not found.");
  const accepted = await deps.prisma.bookingPolicyAcceptance.count({
    where: { policyVersion: { documentId: document.id } },
  });
  if (accepted)
    throw new ApiError(
      409,
      "policy_has_acceptances",
      "Accepted policy documents cannot be deleted.",
    );
  await deps.prisma.policyDocument.delete({ where: { id: document.id } });
  await writeAudit(deps, {
    entityType: "policy",
    entityId: document.id,
    action: "policy.delete",
    actor,
  });
  return ok({ deleted: document.id });
}

export async function getPolicyForms(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  return ok(
    shapeSettingsPayload(actor, { policyFormRequirements: await policyRequirements(deps) }),
  );
}

export async function putPolicyForms(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const requirements = body.requirements;
  if (!requirements || typeof requirements !== "object" || Array.isArray(requirements)) {
    throwFields(
      fieldError("requirements", "invalid_type", "requirements must be a form-to-document-id map."),
    );
  }
  await deps.prisma.$transaction(async (tx) => {
    await tx.policyFormRequirement.deleteMany();
    for (const form of POLICY_FORMS) {
      const ids = (requirements as Record<string, unknown>)[form];
      if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
        throwFields(
          fieldError(
            `requirements.${form}`,
            "invalid_type",
            "Use an array of policy document ids.",
          ),
        );
      }
      for (const [sortOrder, requestedDocument] of ids.entries()) {
        const document = await tx.policyDocument.findFirst({
          where: { OR: [{ id: requestedDocument }, { title: requestedDocument }] },
          select: { id: true },
        });
        if (!document) {
          throwFields(
            fieldError(`requirements.${form}`, "invalid_enum", "Unknown policy document."),
          );
        }
        await tx.policyFormRequirement.create({
          data: { form: PRISMA_POLICY_FORM[form], documentId: document.id, sortOrder },
        });
      }
    }
  });
  await writeAudit(deps, {
    entityType: "policy",
    entityId: "policy-forms",
    action: "policy.forms.update",
    actor,
  });
  return ok(
    shapeSettingsPayload(actor, { policyFormRequirements: await policyRequirements(deps) }),
  );
}

function inferSection(body: Record<string, unknown>): SettingsSection | undefined {
  if (body.business && !body.payment && !body.content) return "business";
  if (body.payment && !body.business && !body.content) return "payment";
  if (body.content && !body.business && !body.payment) return "content";
  return undefined;
}

function hasPath(body: Record<string, unknown>, path: string): boolean {
  const parts = path.split(".");
  let current: unknown = body;
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current) || !(part in current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return true;
}
