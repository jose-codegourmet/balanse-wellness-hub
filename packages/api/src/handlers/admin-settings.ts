import { FIELD_CONSTRAINTS, type SettingsSection, SIGNED_UPLOAD } from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson, searchParams } from "../http";
import {
  activatePaymentQr,
  createConfirmedPaymentQr,
  findActivePaymentQr,
  listPaymentQrs,
  overlayDerivedQr,
  persistDerivedQr,
  serializePaymentQrs,
} from "../payment-qrs";
import { presentPaymentQr } from "../presenters";
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

export async function getAdminSettings(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  return ok(await settingsPayload(deps));
}

async function settingsPayload(deps: ApiDeps) {
  const settings = await overlayDerivedQr(deps, await readSettings(deps));
  const [faqs, paymentQrs] = await Promise.all([
    deps.prisma.faqItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    listPaymentQrs(deps, false),
  ]);
  const policies = await deps.prisma.policyDocument.findMany({
    include: { versions: { orderBy: { createdAt: "desc" } } },
    orderBy: { title: "asc" },
  });
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
      qrs: serializePaymentQrs(paymentQrs),
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
        isCurrent: version.isCurrent,
        isPlaceholder: version.isPlaceholder,
        effectiveFrom: version.effectiveFrom.toISOString(),
      })),
    })),
  };
  assertNoDeveloperConfig(body);
  return body;
}

export async function patchAdminSettings(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  assertNoDeveloperConfig(body);
  const section = (asString(body.section) ?? inferSection(body)) as SettingsSection | undefined;
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
  return ok(await settingsPayload(deps));
}

export async function postSettingsQr(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType)
      throwFields(fieldError("contentType", "required", "contentType is required."));
    const path = `marketing-assets/settings/gcash-qr/${crypto.randomUUID()}.${extensionFor(contentType)}`;
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
  const previous = await findActivePaymentQr(deps);
  const created = await createConfirmedPaymentQr(deps, { label, imageKey: objectKey });
  const activated = (await activatePaymentQr(deps, created.id)) ?? created;
  if (previous && previous.id !== activated.id) {
    await deps.prisma.paymentQrCode.update({
      where: { id: previous.id },
      data: { isActive: false, archivedAt: deps.now() },
    });
  }
  const payment = (await persistDerivedQr(deps)).payment;
  await writeAudit(deps, {
    entityType: "settings",
    entityId: "public_settings",
    action: "settings.qr.replace",
    actor,
    metadata: {
      previous: previous?.imageKey ?? null,
      objectKey,
      qrId: activated.id,
      previousArchived: previous && previous.id !== activated.id ? previous.id : null,
    },
  });
  return ok({
    payment,
    qr: presentPaymentQr(activated),
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
  const items = serializePaymentQrs(await listPaymentQrs(deps, includeArchived));
  return ok({ items, activeId: items.find((row) => row.isActive)?.id ?? null });
}

export async function postPaymentQr(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType)
      throwFields(fieldError("contentType", "required", "contentType is required."));
    const path = `marketing-assets/settings/gcash-qr/${crypto.randomUUID()}.${extensionFor(contentType)}`;
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
  const label = requireString(body, "label", FIELD_CONSTRAINTS.settings.paymentQr.label.max);
  await confirmUpload(deps, objectKey);
  const created = await createConfirmedPaymentQr(deps, { label, imageKey: objectKey });
  if (created.isActive) await persistDerivedQr(deps);
  await writeAudit(deps, {
    entityType: "payment_qr",
    entityId: created.id,
    action: "payment_qr.create",
    actor,
    metadata: { objectKey, isActive: created.isActive },
  });
  return ok({ qr: presentPaymentQr(created) });
}

export async function patchPaymentQr(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await deps.prisma.paymentQrCode.findUnique({ where: { id } });
  if (!existing || existing.archivedAt) {
    throw new ApiError(404, "payment_qr_not_found", "Payment QR not found.");
  }
  const body = await readJson(req);
  const label = optionalString(body, "label", FIELD_CONSTRAINTS.settings.paymentQr.label.max);
  const updated = await deps.prisma.paymentQrCode.update({
    where: { id },
    data: {
      ...(label !== undefined ? { label } : {}),
    },
  });
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
  const activated = await activatePaymentQr(deps, id);
  if (!activated) throw new ApiError(404, "payment_qr_not_found", "Payment QR not found.");
  await persistDerivedQr(deps);
  await writeAudit(deps, {
    entityType: "payment_qr",
    entityId: id,
    action: "payment_qr.activate",
    actor,
  });
  return ok({ qr: presentPaymentQr(activated) });
}

export async function archivePaymentQr(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const existing = await deps.prisma.paymentQrCode.findUnique({ where: { id } });
  if (!existing || existing.archivedAt) {
    throw new ApiError(404, "payment_qr_not_found", "Payment QR not found.");
  }
  if (existing.isActive) {
    throwFields(
      fieldError(
        "id",
        "cannot_remove_active",
        "Activate another QR before archiving the active one.",
      ),
    );
  }
  const archived = await deps.prisma.paymentQrCode.update({
    where: { id },
    data: { isActive: false, archivedAt: deps.now() },
  });
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
  return ok(await settingsPayload(deps));
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
