import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";
import { MARKETING_MIME } from "../presenters";
import {
  assertNoDeveloperConfig,
  mergeSettings,
  readSettings,
  type SettingsPayload,
  writeSettings,
} from "../settings";

export async function getAdminSettings(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const settings = await readSettings(deps);
  const policies = await deps.prisma.policyDocument.findMany({
    include: { versions: { orderBy: { createdAt: "desc" } } },
    orderBy: { title: "asc" },
  });
  const body = {
    business: settings.business,
    payment: settings.payment,
    content: settings.content,
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
  return ok(body);
}

export async function patchAdminSettings(
  deps: ApiDeps,
  req: Request,
  _id?: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  assertNoDeveloperConfig(body);
  const current = await readSettings(deps);
  let next: SettingsPayload = mergeSettings({
    business: { ...current.business, ...(body.business as object) },
    payment: { ...current.payment, ...(body.payment as object) },
    content: {
      ...current.content,
      ...(body.content as object),
    },
  });

  const qrContentType = asString(
    (body.payment as { qrContentType?: unknown } | undefined)?.qrContentType,
  );
  if (qrContentType) {
    if (!MARKETING_MIME.has(qrContentType)) {
      throw new ApiError(400, "invalid_mime", "GCash QR must be jpeg, png, webp, or gif.");
    }
    const ext =
      qrContentType === "image/png"
        ? "png"
        : qrContentType === "image/webp"
          ? "webp"
          : qrContentType === "image/gif"
            ? "gif"
            : "jpg";
    const path = `marketing-assets/settings/gcash-qr.${ext}`;
    const upload = await deps.storage.createSignedUpload("marketing-assets", path, {
      contentType: qrContentType,
    });
    next = {
      ...next,
      payment: {
        ...next.payment,
        gcashQrObjectKey: path,
        gcashQrPublicUrl: deps.storage.publicUrl("marketing-assets", path),
      },
    };
    await writeSettings(deps, next);
    return ok({ settings: next, qrUpload: upload });
  }

  if (asString((body.payment as { gcashQrObjectKey?: unknown } | undefined)?.gcashQrObjectKey)) {
    const key = asString(
      (body.payment as { gcashQrObjectKey?: unknown }).gcashQrObjectKey,
    ) as string;
    next.payment.gcashQrObjectKey = key;
    next.payment.gcashQrPublicUrl = deps.storage.publicUrl("marketing-assets", key);
  }

  const promote = body.promotePolicy as
    | { documentId?: string; version?: string; title?: string; body?: string }
    | undefined;
  if (promote?.documentId && promote.version && promote.body) {
    await deps.prisma.$transaction(async (tx) => {
      await tx.policyDocumentVersion.updateMany({
        where: { documentId: promote.documentId },
        data: { isCurrent: false },
      });
      await tx.policyDocumentVersion.create({
        data: {
          documentId: promote.documentId as string,
          version: promote.version as string,
          title: promote.title ?? `Version ${promote.version}`,
          body: promote.body as string,
          effectiveFrom: deps.now(),
          isCurrent: true,
          isPlaceholder: false,
        },
      });
    });
  }

  await writeSettings(deps, next);
  await writeAudit(deps, {
    entityType: "settings",
    entityId: "public_settings",
    action: "settings.update",
    actor,
  });
  const refreshed = await getAdminSettings(deps, req);
  return refreshed;
}
