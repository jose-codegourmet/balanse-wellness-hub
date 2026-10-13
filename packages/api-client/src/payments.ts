import type { CustomerBooking, PaymentInstructions, PaymentMethod } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export const setPaymentMethod = (fetcher: ApiFetcher, bookingId: string, method: PaymentMethod) =>
  fetcher<{ booking: CustomerBooking }>(`/api/bookings/${bookingId}/payment-method`, {
    method: "POST",
    body: { method },
  });
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
export const confirmPaymentProof = (fetcher: ApiFetcher, bookingId: string, objectKey: string) =>
  fetcher<{ booking: CustomerBooking }>(`/api/bookings/${bookingId}/payment-proof`, {
    method: "POST",
    body: { objectKey },
  });
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
export async function listAdminPayments(
  fetcher: ApiFetcher,
  input: { tab: string; search?: string; cursor?: string; limit?: number },
) {
  const params = new URLSearchParams({ tab: input.tab });
  if (input.search) params.set("q", input.search);
  if (input.cursor) params.set("cursor", input.cursor);
  if (input.limit) params.set("limit", String(input.limit));
  return fetcher<{ items: CustomerBooking[]; nextCursor: string | null; totalCount: number }>(
    `/api/admin/payments?${params}`,
  );
}
export const getPaymentProofSignedUrl = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ signedUrl: string; expiresIn: number }>(`/api/admin/payment-proofs/${id}/signed-url`);
export const recordCash = (fetcher: ApiFetcher, id: string) =>
  fetcher(`/api/admin/payments/${id}/record-cash`, { method: "POST" });
export const markRefundPending = (fetcher: ApiFetcher, id: string, note?: string) =>
  fetcher(`/api/admin/refunds/${id}/mark-pending`, { method: "POST", body: { note } });
export const markRefunded = (fetcher: ApiFetcher, id: string, note?: string) =>
  fetcher(`/api/admin/refunds/${id}/mark-refunded`, { method: "POST", body: { note } });
