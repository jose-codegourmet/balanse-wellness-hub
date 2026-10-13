import type { BookingStatus, PaymentStatus, RefundStatus } from "@balanse/db";
import { bookingListTab, bookingStatusLabel, bookingSurfaceLabel } from "@balanse/domain";

export const PUBLIC_FORBIDDEN_KEYS = [
  "defaultRate",
  "rateType",
  "coachRate",
  "coachRateType",
  "coachAssignments",
  "coachRatePhp",
  "profileId",
  "customerId",
  "email",
  "contactNumber",
  "staffMemberId",
  "staffId",
] as const;

export function presentStaff<
  T extends {
    coach?: { id: string } | null;
    roleDefinition?: { id: string; key: string; name: string; status: string } | null;
  },
>(staff: T) {
  const { coach, roleDefinition, ...rest } = staff;
  return {
    ...rest,
    isCoach: Boolean(coach),
    coachId: coach?.id ?? null,
    roleId: roleDefinition?.id ?? (rest as { roleId?: string }).roleId ?? null,
    roleKey: roleDefinition?.key ?? null,
    roleName: roleDefinition?.name ?? null,
    roleStatus: roleDefinition?.status ?? null,
  };
}

export function presentCoach<T extends { staffMemberId?: string | null }>(coach: T) {
  const { staffMemberId, ...rest } = coach;
  return {
    ...rest,
    staffId: staffMemberId ?? null,
  };
}

export function presentPaymentQr(row: {
  id: string;
  type: "GCASH" | "MAYA" | "QRPH";
  label: string;
  accountName: string;
  accountNumber: string;
  imageKey: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}) {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    accountName: row.accountName,
    accountNumber: row.accountNumber,
    imageKey: row.imageKey,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString() ?? null,
  };
}

export function money(value: unknown): string {
  if (value == null) return "0.00";
  if (typeof value === "number") return value.toFixed(2);
  return String(value);
}

export type SessionAvailability =
  | "open"
  | "nearly_full"
  | "full_with_waitlist"
  | "past"
  | "cancelled"
  | "past_cutoff";

/**
 * #361 — availability bucket shared by the public and admin session
 * presenters. "nearly_full" has no formal spec threshold; ≤2 remaining
 * slots is a judgment call consistent with the fixture data (open at 8/12
 * remaining, nearly_full at 1/10).
 */
export function sessionAvailability(input: {
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  remainingSlots: number;
  pastStart: boolean;
  pastCutoff: boolean;
}): SessionAvailability {
  if (input.status === "CANCELLED") return "cancelled";
  if (input.pastStart) return "past";
  if (input.pastCutoff) return "past_cutoff";
  if (input.remainingSlots <= 0) return "full_with_waitlist";
  if (input.remainingSlots <= 2) return "nearly_full";
  return "open";
}

export function assertPublicPayload(payload: unknown): void {
  const raw = JSON.stringify(payload);
  for (const key of PUBLIC_FORBIDDEN_KEYS) {
    if (new RegExp(`"${key}"`).test(raw)) {
      throw new Error(`Public payload leaked ${key}`);
    }
  }
}

export function bookingStatusPayload(status: BookingStatus, refundStatus?: RefundStatus | null) {
  return {
    status,
    statusLabel: bookingStatusLabel(status),
    statusLabelKey: status,
    surfaceLabel: bookingSurfaceLabel({
      status,
      refundStatus: refundStatus ?? undefined,
    }),
  };
}

export function groupOwnBookings<T extends { status: BookingStatus }>(bookings: T[]) {
  return {
    upcoming: bookings.filter((item) => bookingListTab(item.status) === "upcoming"),
    pending: bookings.filter((item) => bookingListTab(item.status) === "pending"),
    history: bookings.filter((item) => bookingListTab(item.status) === "history"),
  };
}

export const PAYMENT_PROOF_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;

export const COACH_PHOTO_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export const MARKETING_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "NONE":
      return "Not started";
    case "PROOF_SUBMITTED":
      return "Proof submitted";
    case "CASH_RECEIVED":
      return "Cash received";
    case "VERIFIED":
      return "Verified";
    case "REJECTED":
      return "Payment not accepted";
    default:
      return status;
  }
}
