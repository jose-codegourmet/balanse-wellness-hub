import type {
  CustomerBooking,
  PaymentMethod,
  PaymentStatus,
  PublicSession,
  RefundStatus,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";
import { phpToNumber } from "./money";

export type BookingWire = {
  id: string;
  profileId?: string;
  customerName?: string;
  sessionId: string;
  status: CustomerBooking["status"];
  paymentMethod: PaymentMethod | null;
  payment?: { status: PaymentStatus } | null;
  refund?: { status: RefundStatus } | null;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  holdExpiresAt: string | null;
  reservedAt: string;
  session: {
    id: string;
    classId: string;
    className: string;
    coaches: PublicSession["coaches"];
    startsAt: string;
    endsAt: string;
    customerPrice: string;
    capacity: number;
    remainingSlots?: number;
    reservable?: boolean;
    status?: PublicSession["status"];
    /** #380 — absent on admin queue rows, which never show customer actions. */
    cancellable?: boolean;
    reschedulable?: boolean;
  };
  targetSession?: BookingWire["session"] | null;
  cancellationReason?: string | null;
  requestCreatedAt?: string | null;
  targetSessionId?: string | null;
  rejectReason?: string | null;
  proofPreviewUrl?: string | null;
  entitlementId?: string | null;
  intendedEntitlementId?: string | null;
  packageName?: string | null;
  packagePromotionBlocked?: boolean;
  redemption?: CustomerBooking["redemption"];
};

function presentSession(row: BookingWire["session"]): PublicSession {
  const remainingSlots = row.remainingSlots ?? 0;
  const status = row.status ?? "PUBLISHED";
  return {
    id: row.id,
    classId: row.classId,
    className: row.className,
    coaches: row.coaches,
    coachName: row.coaches.map((coach) => coach.name).join(" & "),
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    pricePhp: phpToNumber(row.customerPrice),
    capacity: row.capacity,
    remainingSlots,
    reservable: row.reservable ?? (status === "PUBLISHED" && remainingSlots > 0),
    availability: remainingSlots > 0 ? "open" : "full_with_waitlist",
    status,
    cancellable: row.cancellable ?? true,
    reschedulable: row.reschedulable ?? true,
  };
}

export function toCustomerBooking(
  row: BookingWire,
  customerId = row.profileId ?? "",
): CustomerBooking {
  return {
    id: row.id,
    customerId,
    customerName: row.customerName ?? "",
    sessionId: row.sessionId,
    status: row.status,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus ?? row.payment?.status ?? "NONE",
    refundStatus: row.refundStatus ?? row.refund?.status ?? "NOT_APPLICABLE",
    holdExpiresAt: row.holdExpiresAt,
    createdAt: row.reservedAt,
    session: presentSession(row.session),
    cancellationReason: row.cancellationReason,
    requestCreatedAt: row.requestCreatedAt,
    targetSessionId: row.targetSessionId,
    targetSession: row.targetSession ? presentSession(row.targetSession) : null,
    rejectReason: row.rejectReason,
    proofPreviewUrl: row.proofPreviewUrl,
    entitlementId: row.entitlementId,
    intendedEntitlementId: row.intendedEntitlementId,
    packageName: row.packageName,
    packagePromotionBlocked: row.packagePromotionBlocked,
    redemption: row.redemption ?? null,
  };
}
export type BookingInput = {
  sessionId: string;
  policyVersionIds: string[];
  entitlementId?: string | null;
  intendedEntitlementId?: string | null;
};
export async function listMyBookings(
  fetcher: ApiFetcher,
  customerId: string,
): Promise<CustomerBooking[]> {
  const body = await fetcher<{ items: BookingWire[] }>("/api/bookings");
  return body.items.map((booking) => toCustomerBooking(booking, customerId));
}
export async function getMyBooking(
  fetcher: ApiFetcher,
  id: string,
  customerId: string,
): Promise<CustomerBooking> {
  const body = await fetcher<{ booking: BookingWire }>(`/api/bookings/${id}`);
  return toCustomerBooking(body.booking, customerId);
}
export async function createBooking(fetcher: ApiFetcher, input: BookingInput) {
  const body = await fetcher<{
    kind: "hold" | "waitlist";
    waitlistEntryId?: string;
    booking: BookingWire;
  }>("/api/bookings", { method: "POST", body: input });
  return { ...body, booking: toCustomerBooking(body.booking) };
}
export async function joinBookingWaitlist(
  fetcher: ApiFetcher,
  id: string,
  policyVersionIds: string[],
) {
  const body = await fetcher<{ kind: "waitlist"; booking: BookingWire }>(
    `/api/bookings/${id}/waitlist`,
    { method: "POST", body: { policyVersionIds } },
  );
  return { ...body, booking: toCustomerBooking(body.booking) };
}
// `getPublicSession` moved to `./sessions` (WIRE-0406, #361) — the real
// `/api/public/sessions/{id}` response is the flat `PublicSessionPage` shape,
// not the nested `{class: {...}}`/`customerPrice`/`nonReservableReason` shape
// this file used to parse.
export type AdminBookingFilters = {
  tab?: string;
  q?: string;
  classId?: string;
  date?: string;
  cursor?: string;
  limit?: number;
};
export async function listAdminBookings(fetcher: ApiFetcher, filters: AdminBookingFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined && value !== "") params.set(key, String(value));
  const suffix = params.size ? `?${params}` : "";
  const body = await fetcher<{ items: BookingWire[]; nextCursor: string | null; total: number }>(
    `/api/admin/bookings${suffix}`,
  );
  return { ...body, items: body.items.map((booking) => toCustomerBooking(booking)) };
}
export const confirmAdminBooking = (fetcher: ApiFetcher, id: string) =>
  fetcher(`/api/admin/bookings/${id}/confirm`, { method: "POST" });
export const rejectAdminBooking = (fetcher: ApiFetcher, id: string, reason: string) =>
  fetcher(`/api/admin/bookings/${id}/reject`, { method: "POST", body: { reason } });
