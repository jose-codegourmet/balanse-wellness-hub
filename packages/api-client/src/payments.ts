import type { CustomerBooking, PaymentInstructions, PaymentMethod } from "@balanse/domain";
import { type BookingWire, toCustomerBooking } from "./bookings";
import type { ApiFetcher } from "./classes";

/** Returns the updated booking mapped like every other booking read (price in pesos). */
export async function setPaymentMethod(
  fetcher: ApiFetcher,
  bookingId: string,
  method: PaymentMethod,
): Promise<{ booking: CustomerBooking }> {
  const body = await fetcher<{ booking: BookingWire }>(
    `/api/bookings/${bookingId}/payment-method`,
    {
      method: "POST",
      body: { method },
    },
  );
  return { ...body, booking: toCustomerBooking(body.booking) };
}
export const mintPaymentProof = (
  fetcher: ApiFetcher,
  bookingId: string,
  contentType: string,
  byteSize: number,
) =>
  fetcher<{ upload: { signedUrl: string; path: string }; maxBytes: number }>(
    `/api/bookings/${bookingId}/payment-proof`,
    { method: "POST", body: { contentType, byteSize } },
  );
/** Confirms an uploaded receipt; the returned booking is mapped (price in pesos). */
export async function confirmPaymentProof(
  fetcher: ApiFetcher,
  bookingId: string,
  objectKey: string,
): Promise<{ booking: CustomerBooking }> {
  const body = await fetcher<{ booking: BookingWire }>(`/api/bookings/${bookingId}/payment-proof`, {
    method: "POST",
    body: { objectKey },
  });
  return { ...body, booking: toCustomerBooking(body.booking) };
}
/** `accounts[]` is the live `payment_qr_codes` collection (WIRE-0901, #364; WIRE-1701, #371). */
export async function getPaymentInstructions(fetcher: ApiFetcher): Promise<PaymentInstructions> {
  const row = await fetcher<{
    accountName: string;
    number: string;
    qrObjectKey: string | null;
    qrPublicUrl: string | null;
    accounts: PaymentInstructions["accounts"];
  }>("/api/payment-instructions");
  return {
    gcashName: row.accountName,
    gcashNumber: row.number,
    qrImageKey: row.qrPublicUrl ?? row.qrObjectKey,
    notes: "Send the exact session amount, then upload your proof.",
    accounts: row.accounts,
  };
}
type AdminPaymentWire = BookingWire & {
  customerId?: string;
  paymentId?: string | null;
  refundId?: string | null;
  hasProof?: boolean;
};

/** Payment queue rows, mapped like every other booking (php_decimal price → `pricePhp`). */
export async function listAdminPayments(
  fetcher: ApiFetcher,
  input: { tab: string; search?: string; cursor?: string; limit?: number },
): Promise<{ items: CustomerBooking[]; nextCursor: string | null; totalCount: number }> {
  const params = new URLSearchParams({ tab: input.tab });
  if (input.search) params.set("q", input.search);
  if (input.cursor) params.set("cursor", input.cursor);
  if (input.limit) params.set("limit", String(input.limit));
  const body = await fetcher<{
    items: AdminPaymentWire[];
    nextCursor: string | null;
    totalCount: number;
  }>(`/api/admin/payments?${params}`);
  return {
    ...body,
    items: body.items.map((row) => ({
      ...toCustomerBooking(row, row.customerId ?? row.profileId ?? ""),
      paymentId: row.paymentId ?? null,
      refundId: row.refundId ?? null,
      hasProof: row.hasProof ?? Boolean(row.proofPreviewUrl),
    })),
  };
}
export const getPaymentProofSignedUrl = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ signedUrl: string; expiresIn: number }>(`/api/admin/payment-proofs/${id}/signed-url`);
/**
 * Record cash received at the counter. `confirm: true` also confirms the booking
 * in the same server transaction (the counter "Cash received" action).
 */
export const recordCash = (fetcher: ApiFetcher, id: string, options: { confirm?: boolean } = {}) =>
  fetcher<{
    payment: { id: string; status: string; method: string };
    booking: { id: string; status: CustomerBooking["status"] };
    confirmed: boolean;
  }>(`/api/admin/payments/${id}/record-cash`, {
    method: "POST",
    body: options.confirm ? { confirm: true } : undefined,
  });
/** Reject a GCash receipt; the booking returns to Payment Needed so the customer can pay again. */
export const rejectPaymentProof = (fetcher: ApiFetcher, paymentId: string, reason: string) =>
  fetcher<{ payment: { id: string; status: string }; booking: { id: string; status: string } }>(
    `/api/admin/payments/${paymentId}/reject-proof`,
    { method: "POST", body: { reason } },
  );
export const markRefundPending = (fetcher: ApiFetcher, id: string, note?: string) =>
  fetcher(`/api/admin/refunds/${id}/mark-pending`, { method: "POST", body: { note } });
export const markRefunded = (fetcher: ApiFetcher, id: string, note?: string) =>
  fetcher(`/api/admin/refunds/${id}/mark-refunded`, { method: "POST", body: { note } });
