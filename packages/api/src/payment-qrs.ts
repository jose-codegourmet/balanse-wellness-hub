import { FIELD_CONSTRAINTS } from "@balanse/domain";
import type { ApiDeps } from "./deps";
import { presentPaymentQr } from "./presenters";
import { readSettings, type SettingsPayload, writeSettings } from "./settings";
import { fieldError, throwFields } from "./validation";

export const PAYMENT_QR_MAX_ITEMS = FIELD_CONSTRAINTS.settings.paymentQr.maxItems;

export async function findActivePaymentQr(deps: ApiDeps) {
  return deps.prisma.paymentQrCode.findFirst({
    where: { isActive: true, archivedAt: null },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listPaymentQrs(deps: ApiDeps, includeArchived: boolean) {
  return deps.prisma.paymentQrCode.findMany({
    where: includeArchived ? {} : { archivedAt: null },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function overlayDerivedQr(
  deps: ApiDeps,
  settings: SettingsPayload,
): Promise<SettingsPayload> {
  const active = await findActivePaymentQr(deps);
  const key = active?.imageKey ?? settings.payment.gcashQrObjectKey ?? "";
  const url = key ? deps.storage.publicUrl("marketing-assets", key) : "";
  return {
    ...settings,
    payment: {
      ...settings.payment,
      gcashQrObjectKey: key,
      gcashQrPublicUrl: url,
    },
  };
}

export async function persistDerivedQr(deps: ApiDeps): Promise<SettingsPayload> {
  const current = await readSettings(deps);
  const next = await overlayDerivedQr(deps, current);
  if (
    current.payment.gcashQrObjectKey === next.payment.gcashQrObjectKey &&
    current.payment.gcashQrPublicUrl === next.payment.gcashQrPublicUrl
  ) {
    return next;
  }
  return writeSettings(deps, next);
}

export async function activatePaymentQr(deps: ApiDeps, id: string) {
  const target = await deps.prisma.paymentQrCode.findUnique({ where: { id } });
  if (!target) return null;
  if (target.archivedAt) {
    throwFields(fieldError("id", "inactive_reference", "Archived QR codes cannot be activated."));
  }
  if (target.isActive) return target;
  return deps.prisma.$transaction(async (tx) => {
    await tx.paymentQrCode.updateMany({
      where: { isActive: true, archivedAt: null, id: { not: id } },
      data: { isActive: false },
    });
    return tx.paymentQrCode.update({
      where: { id },
      data: { isActive: true, archivedAt: null },
    });
  });
}

export async function createConfirmedPaymentQr(
  deps: ApiDeps,
  input: { label: string; imageKey: string },
) {
  const liveCount = await deps.prisma.paymentQrCode.count({ where: { archivedAt: null } });
  if (liveCount >= PAYMENT_QR_MAX_ITEMS) {
    throwFields(
      fieldError(
        "paymentQrs",
        "qr_limit",
        `At most ${PAYMENT_QR_MAX_ITEMS} non-archived payment QR codes.`,
      ),
    );
  }
  const existing = await deps.prisma.paymentQrCode.findUnique({
    where: { imageKey: input.imageKey },
  });
  if (existing) {
    if (existing.archivedAt) {
      throwFields(
        fieldError("objectKey", "duplicate_value", "This image belongs to an archived QR."),
      );
    }
    return existing;
  }
  const hasActive = Boolean(await findActivePaymentQr(deps));
  return deps.prisma.paymentQrCode.create({
    data: {
      label: input.label,
      imageKey: input.imageKey,
      isActive: !hasActive,
    },
  });
}

export function serializePaymentQrs(
  rows: Array<{
    id: string;
    label: string;
    imageKey: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date | null;
  }>,
) {
  return rows.map(presentPaymentQr);
}
