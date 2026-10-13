import { FIELD_CONSTRAINTS } from "@balanse/domain";
import type { ApiDeps } from "./deps";
import { ApiError } from "./errors";
import { readSettings, type SettingsPayload, writeSettings } from "./settings";
import { fieldError, throwFields } from "./validation";

export const PAYMENT_QR_MAX_ITEMS = FIELD_CONSTRAINTS.settings.paymentQr.maxItems;

/** Every account currently shown to customers at checkout (decision 2, WIRE-1701/#371 — several may be active at once). */
export async function listActivePaymentQrs(deps: ApiDeps) {
  return deps.prisma.paymentQrCode.findMany({
    where: { isActive: true, archivedAt: null },
    orderBy: [{ createdAt: "asc" }],
  });
}

/**
 * The legacy singular `settings.payment.gcash*` fields, derived from the
 * first account currently shown at checkout (WIRE-1701/#371 — kept for
 * readers of the general settings payload; the payment-accounts screen
 * itself reads the full collection via `listPaymentQrs`/`listActivePaymentQrs`).
 */
export async function overlayDerivedQr(
  deps: ApiDeps,
  settings: SettingsPayload,
): Promise<SettingsPayload> {
  const [primary] = await listActivePaymentQrs(deps);
  const key = primary?.imageKey ?? settings.payment.gcashQrObjectKey ?? "";
  const url = key ? deps.storage.publicUrl("marketing-assets", key) : "";
  return {
    ...settings,
    payment: {
      ...settings.payment,
      gcashAccountName: primary?.accountName || settings.payment.gcashAccountName,
      gcashNumber: primary?.accountNumber || settings.payment.gcashNumber,
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

export async function listPaymentQrs(deps: ApiDeps, includeArchived: boolean) {
  return deps.prisma.paymentQrCode.findMany({
    where: includeArchived ? {} : { archivedAt: null },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * At least one account must stay visible while any non-archived account
 * exists (decision 2) — a cross-row invariant enforced here rather than in
 * SQL, same as the pre-existing "cannot archive the active QR" check.
 * Hiding/archiving the last *non-archived* row of all is fine — the
 * collection is allowed to go empty.
 */
export async function assertNotLastVisibleAccount(deps: ApiDeps, id: string): Promise<void> {
  const otherNonArchived = await deps.prisma.paymentQrCode.count({
    where: { archivedAt: null, id: { not: id } },
  });
  if (otherNonArchived === 0) return;
  const otherActive = await deps.prisma.paymentQrCode.count({
    where: { isActive: true, archivedAt: null, id: { not: id } },
  });
  if (otherActive === 0) {
    throwFields(
      fieldError(
        "isActive",
        "cannot_hide_last_account",
        "Show another account before hiding or removing this one.",
      ),
    );
  }
}

export async function assertPaymentAccountLimitNotReached(deps: ApiDeps): Promise<void> {
  const liveCount = await deps.prisma.paymentQrCode.count({ where: { archivedAt: null } });
  if (liveCount >= PAYMENT_QR_MAX_ITEMS) {
    throwFields(
      fieldError(
        "paymentQrs",
        "qr_limit",
        `At most ${PAYMENT_QR_MAX_ITEMS} non-archived payment accounts.`,
      ),
    );
  }
}

export async function getOwnedPaymentQr(deps: ApiDeps, id: string) {
  const existing = await deps.prisma.paymentQrCode.findUnique({ where: { id } });
  if (!existing || existing.archivedAt) {
    throw new ApiError(404, "payment_qr_not_found", "Payment account not found.");
  }
  return existing;
}

/**
 * Creates a confirmed account row. `imageKey` must already be a confirmed
 * upload (or null) — minting/confirming is its own step (WIRE-1702/#371).
 */
export async function createPaymentAccount(
  deps: ApiDeps,
  input: {
    type: "GCASH" | "MAYA" | "QRPH";
    label: string;
    accountName: string;
    accountNumber: string;
    imageKey: string | null;
    isActive: boolean;
  },
) {
  await assertPaymentAccountLimitNotReached(deps);
  if (input.imageKey) {
    const existing = await deps.prisma.paymentQrCode.findUnique({
      where: { imageKey: input.imageKey },
    });
    if (existing) {
      throwFields(
        fieldError("imageKey", "duplicate_value", "This image belongs to another account."),
      );
    }
  }
  return deps.prisma.paymentQrCode.create({ data: input });
}

/**
 * Sets `isActive` directly — several accounts may be active at once
 * (decision 2), so this never deactivates siblings. Hiding the last visible
 * account while other non-archived accounts exist is rejected.
 */
export async function setPaymentQrActive(deps: ApiDeps, id: string, active: boolean) {
  const target = await getOwnedPaymentQr(deps, id);
  if (target.isActive === active) return target;
  if (!active) await assertNotLastVisibleAccount(deps, id);
  return deps.prisma.paymentQrCode.update({ where: { id }, data: { isActive: active } });
}
