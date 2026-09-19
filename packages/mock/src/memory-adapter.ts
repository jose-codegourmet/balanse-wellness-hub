import type { PaymentMethod, PublicSession } from "@balanse/domain";
import { formatPeso } from "@balanse/domain";
import type { MockDataAdapter } from "./adapter";
import {
  adminCoaches,
  customers,
  paymentInstructions,
  policyAcceptances,
  publicClasses,
  publicCoaches,
  publicContent,
  publicSessions,
  bookings as seedBookings,
  staff,
  toPublicCoach,
} from "./fixtures";
import { applyMockEffects, getMockRuntime } from "./runtime";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createMemoryAdapter(): MockDataAdapter {
  let bookings = seedBookings.map((b) => clone(b));
  const sessions = publicSessions.map((s) => clone(s));
  const profiles = customers.map((c) => clone(c));

  const findBooking = (id: string) => bookings.find((b) => b.id === id) ?? null;

  const withFullOverlay = (session: PublicSession): PublicSession => {
    const fullId = getMockRuntime().sessionBecameFullId;
    if (!fullId || session.id !== fullId) return session;
    return {
      ...session,
      remainingSlots: 0,
      reservable: false,
      availability: "full_with_waitlist",
    };
  };

  return {
    getPublicSessions: (query) =>
      applyMockEffects(
        () => {
          return sessions
            .filter((session) => {
              if (query?.from && session.startsAt < query.from) return false;
              if (query?.to && session.startsAt > query.to) return false;
              return true;
            })
            .map(withFullOverlay);
        },
        { publicSessions: true },
      ),
    getPublicSession: (id) =>
      applyMockEffects(
        () => {
          const session = sessions.find((s) => s.id === id);
          return session ? withFullOverlay(session) : null;
        },
        { publicSessions: true },
      ),
    getPublicCoaches: () => applyMockEffects(() => publicCoaches.map((c) => clone(c))),
    getPublicClasses: () => applyMockEffects(() => publicClasses.map((c) => clone(c))),
    getPublicContent: () => applyMockEffects(() => clone(publicContent)),

    getMe: (customerId) =>
      applyMockEffects(() => profiles.find((p) => p.id === customerId) ?? null),
    patchMe: (customerId, patch) =>
      applyMockEffects(() => {
        const profile = profiles.find((p) => p.id === customerId);
        if (!profile) throw new Error("Profile not found");
        Object.assign(profile, patch);
        return clone(profile);
      }),
    getMePolicyAcceptances: (customerId) =>
      applyMockEffects(() => clone(policyAcceptances[customerId] ?? [])),

    createBooking: ({ customerId, sessionId }) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) throw new Error("Session not found");
        const created = {
          id: `booking-new-${sessionId}`,
          customerId,
          sessionId,
          status:
            session.remainingSlots > 0
              ? ("HELD_AWAITING_PAYMENT" as const)
              : ("WAITLISTED" as const),
          paymentMethod: null,
          paymentStatus: "NONE" as const,
          refundStatus: "NOT_APPLICABLE" as const,
          holdExpiresAt: session.startsAt,
          createdAt: session.startsAt,
          session,
        };
        bookings = [created, ...bookings];
        return clone(created);
      }),
    getBookings: (customerId) =>
      applyMockEffects(() =>
        bookings.filter((b) => b.customerId === customerId).map((b) => clone(b)),
      ),
    getBooking: (id) => applyMockEffects(() => clone(findBooking(id))),
    joinWaitlist: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "WAITLISTED";
        return clone(booking);
      }),
    setPaymentMethod: (bookingId, method: PaymentMethod) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.paymentMethod = method;
        return clone(booking);
      }),
    uploadPaymentProof: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "PAYMENT_SUBMITTED";
        booking.paymentStatus = "PROOF_SUBMITTED";
        return clone(booking);
      }),
    getPaymentInstructions: () => applyMockEffects(() => clone(paymentInstructions)),
    createCancellationRequest: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CANCELLATION_REQUESTED";
        return clone(booking);
      }),
    createRescheduleRequest: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "RESCHEDULE_REQUESTED";
        return clone(booking);
      }),

    getAdminBookings: (filters) =>
      applyMockEffects(() => {
        return bookings.filter((booking) => {
          if (filters?.status && booking.status !== filters.status) return false;
          if (filters?.query) {
            const q = filters.query.toLowerCase();
            const customer = profiles.find((p) => p.id === booking.customerId);
            if (!customer?.fullName.toLowerCase().includes(q) && !booking.id.includes(q)) {
              return false;
            }
          }
          return true;
        });
      }),
    confirmAdminBooking: (id) =>
      applyMockEffects(() => {
        const booking = findBooking(id);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CONFIRMED";
        return clone(booking);
      }),
    rejectAdminBooking: (id) =>
      applyMockEffects(() => {
        const booking = findBooking(id);
        if (!booking) throw new Error("Booking not found");
        booking.status = "REJECTED";
        return clone(booking);
      }),
    getAdminPayments: () => applyMockEffects(() => bookings.map((b) => clone(b))),
    recordCash: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.paymentMethod = "PAY_AT_COUNTER";
        booking.paymentStatus = "CASH_RECEIVED";
        return clone(booking);
      }),
    markRefundPending: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.refundStatus = "REFUND_PENDING";
        return clone(booking);
      }),
    markRefunded: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.refundStatus = "REFUNDED";
        return clone(booking);
      }),
    getAdminPaymentProofSignedUrl: (bookingId) =>
      applyMockEffects(() => ({ url: `blob:mock-proof-${bookingId}` })),
    getAdminClasses: () => applyMockEffects(() => publicClasses.map((c) => clone(c))),
    getAdminCoaches: () => applyMockEffects(() => adminCoaches.map((c) => clone(c))),
    getAdminSessions: () => applyMockEffects(() => sessions.map((s) => clone(s))),
    cancelAdminSession: (id) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === id);
        if (!session) throw new Error("Session not found");
        session.status = "CANCELLED";
        session.availability = "cancelled";
        session.reservable = false;
        return clone(session);
      }),
    getAdminCancellationRequests: () =>
      applyMockEffects(() => bookings.filter((b) => b.status === "CANCELLATION_REQUESTED")),
    getAdminRescheduleRequests: () =>
      applyMockEffects(() => bookings.filter((b) => b.status === "RESCHEDULE_REQUESTED")),
    getAdminSessionRoster: (sessionId) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) throw new Error("Session not found");
        const rows = bookings.filter((b) => b.sessionId === sessionId);
        const confirmed = rows.filter((b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN");
        const held = rows.filter(
          (b) => b.status === "HELD_AWAITING_PAYMENT" || b.status === "PAYMENT_SUBMITTED",
        );
        const waitlisted = rows.filter((b) => b.status === "WAITLISTED");
        return {
          confirmed,
          held,
          waitlisted,
          capacity: session.capacity,
          confirmedCount: confirmed.length,
          heldCount: held.length,
          available: session.remainingSlots,
          waitlistedCount: waitlisted.length,
          checkedIn: rows.filter((b) => b.status === "CHECKED_IN").length,
          noShow: rows.filter((b) => b.status === "NO_SHOW").length,
        };
      }),
    checkIn: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CHECKED_IN";
        return clone(booking);
      }),
    markNoShow: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "NO_SHOW";
        return clone(booking);
      }),
    getAdminReportsSales: () =>
      applyMockEffects(() => {
        const paid = bookings.filter(
          (b) => b.paymentStatus === "VERIFIED" || b.paymentStatus === "CASH_RECEIVED",
        );
        const grossPhp = paid.reduce((sum, b) => sum + b.session.pricePhp, 0);
        const refundsPhp = bookings
          .filter((b) => b.refundStatus === "REFUNDED")
          .reduce((sum, b) => sum + b.session.pricePhp, 0);
        void formatPeso(grossPhp);
        return { grossPhp, refundsPhp, netPhp: grossPhp - refundsPhp };
      }),
    getAdminStaff: () => applyMockEffects(() => staff.map((s) => clone(s))),
    getAdminCustomers: () =>
      applyMockEffects(() =>
        profiles.map((p) => ({
          ...p,
          bookingCount: bookings.filter((b) => b.customerId === p.id).length,
        })),
      ),
    getAdminCustomer: (id) =>
      applyMockEffects(() => {
        const profile = profiles.find((p) => p.id === id);
        if (!profile) return null;
        return { ...profile, bookingCount: bookings.filter((b) => b.customerId === id).length };
      }),
    getAdminSettings: () => applyMockEffects(() => ({ ...publicContent, ...paymentInstructions })),
  };
}

export const mockAdapter = createMemoryAdapter();

export function getMockAdapter(): MockDataAdapter {
  return mockAdapter;
}

export { toPublicCoach };
