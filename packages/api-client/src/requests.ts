import type { BookingStatus, CustomerBooking, PaymentStatus, RefundStatus } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type AdminCancellationRequest = {
  /** Cancellation request id, used by the complete/reject endpoints. */
  id: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  className: string;
  sessionName: string | null;
  sessionStartsAt: string;
  reason: string | null;
  requestedAt: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  paymentId: string | null;
  refundId: string | null;
};

const query = (values: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
  return params.toString();
};
export const createCancellationRequest = (
  fetcher: ApiFetcher,
  bookingId: string,
  reason?: string,
) =>
  fetcher(`/api/bookings/${bookingId}/cancellation-request`, { method: "POST", body: { reason } });
export const createRescheduleRequest = (
  fetcher: ApiFetcher,
  bookingId: string,
  targetSessionId: string,
) =>
  fetcher(`/api/bookings/${bookingId}/reschedule-request`, {
    method: "POST",
    body: { targetSessionId },
  });
export const listCancellations = (
  fetcher: ApiFetcher,
  input: { cursor?: string; search?: string } = {},
) =>
  fetcher<{ items: AdminCancellationRequest[]; nextCursor: string | null; totalCount: number }>(
    `/api/admin/cancellation-requests?${query({ cursor: input.cursor, q: input.search })}`,
  );
export const completeCancellation = (fetcher: ApiFetcher, id: string) =>
  fetcher(`/api/admin/cancellation-requests/${id}/complete`, { method: "POST" });
export const rejectCancellation = (fetcher: ApiFetcher, id: string, reason: string) =>
  fetcher(`/api/admin/cancellation-requests/${id}/reject`, { method: "POST", body: { reason } });
export const listReschedules = (
  fetcher: ApiFetcher,
  input: { cursor?: string; search?: string } = {},
) =>
  fetcher<{ items: CustomerBooking[]; nextCursor: string | null; totalCount: number }>(
    `/api/admin/reschedule-requests?${query({ cursor: input.cursor, q: input.search })}`,
  );
export const approveReschedule = (fetcher: ApiFetcher, id: string) =>
  fetcher(`/api/admin/reschedule-requests/${id}/approve`, { method: "POST" });
export const rejectReschedule = (fetcher: ApiFetcher, id: string, reason: string) =>
  fetcher(`/api/admin/reschedule-requests/${id}/reject`, { method: "POST", body: { reason } });
