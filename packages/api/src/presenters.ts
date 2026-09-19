import type { BookingStatus, PaymentStatus, RefundStatus } from "@balanse/db";
import { bookingListTab, bookingStatusLabel, bookingSurfaceLabel } from "@balanse/domain";

export const PUBLIC_FORBIDDEN_KEYS = [
  "defaultRate",
  "rateType",
  "coachRate",
  "coachRateType",
  "profileId",
  "customerId",
  "email",
  "contactNumber",
] as const;

export function money(value: unknown): string {
  if (value == null) return "0.00";
  if (typeof value === "number") return value.toFixed(2);
  return String(value);
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
