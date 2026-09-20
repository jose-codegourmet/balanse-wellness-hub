import type {
  AdminClass,
  AdminCoach,
  AdminPaymentTab,
  AdminSession,
  CursorPage,
  CustomerBooking,
  PaymentMethod,
  PolicyAcceptance,
  PublicSession,
} from "@balanse/domain";
import {
  ADMIN_PAYMENT_HOLD_SORT,
  ADMIN_PAYMENT_REFUND_SORT,
  ADMIN_REQUEST_QUEUE_SORT,
  bookingListTab,
  buildAdminCustomerRow,
  buildAdminDashboard,
  canApproveReschedule,
  computeAdminReports,
  computeHoldExpiresAt,
  computeSessionDrilldown,
  computeSessionInventory,
  filterPaymentQueue,
  formatPeso,
  manilaYmd,
  sliceCursorPage,
  toPublicSession,
  validateSessionCapacity,
} from "@balanse/domain";
import type { AdminPaymentQueueQuery, AdminRequestQueueQuery, MockDataAdapter } from "./adapter";
import {
  customers,
  MOCK_NOW_ISO,
  MOCK_PROOF_PREVIEW_URL,
  paymentInstructions,
  publicClasses,
  publicCoaches,
  publicContent,
  policyAcceptances as seedAcceptances,
  bookings as seedBookings,
  adminClasses as seedClasses,
  adminCoaches as seedCoaches,
  adminSessions as seedSessions,
  adminSettings as seedSettings,
  staff as seedStaff,
  toPublicCoach,
} from "./fixtures";
import { applyMockEffects, getMockRuntime } from "./runtime";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function requestQueueKey(row: CustomerBooking): string {
  return row.requestCreatedAt ?? row.createdAt;
}

function sortRequestQueue(rows: CustomerBooking[]): CustomerBooking[] {
  return [...rows].sort((a, b) => {
    const keyCmp = requestQueueKey(b).localeCompare(requestQueueKey(a));
    return keyCmp !== 0 ? keyCmp : b.id.localeCompare(a.id);
  });
}

function sortPaymentHoldQueue(rows: CustomerBooking[]): CustomerBooking[] {
  return [...rows].sort((a, b) => {
    const keyCmp = (a.holdExpiresAt ?? "").localeCompare(b.holdExpiresAt ?? "");
    return keyCmp !== 0 ? keyCmp : a.id.localeCompare(b.id);
  });
}

function sortPaymentRefundQueue(rows: CustomerBooking[]): CustomerBooking[] {
  return [...rows].sort((a, b) => {
    const keyCmp = b.createdAt.localeCompare(a.createdAt);
    return keyCmp !== 0 ? keyCmp : b.id.localeCompare(a.id);
  });
}

function paymentQueueSort(tab: AdminPaymentTab): string {
  return tab === "refunds" ? ADMIN_PAYMENT_REFUND_SORT : ADMIN_PAYMENT_HOLD_SORT;
}

function paymentQueueKeyOf(tab: AdminPaymentTab) {
  return (row: CustomerBooking) => (tab === "refunds" ? row.createdAt : row.holdExpiresAt);
}

function sortPaymentTab(rows: CustomerBooking[], tab: AdminPaymentTab): CustomerBooking[] {
  return tab === "refunds" ? sortPaymentRefundQueue(rows) : sortPaymentHoldQueue(rows);
}

const EMPTY_CURSOR_PAGE: CursorPage<CustomerBooking> = {
  items: [],
  nextCursor: null,
  totalCount: 0,
};

export function createMemoryAdapter(): MockDataAdapter {
  let bookings = seedBookings.map((b) => clone(b));
  let sessions = seedSessions.map((s) => clone(s));
  const profiles = customers.map((c) => clone(c));
  const acceptances: Record<string, PolicyAcceptance[]> = clone(seedAcceptances);
  let classes = seedClasses.map((c) => clone(c));
  let coaches = seedCoaches.map((c) => clone(c));
  let staffRows = seedStaff.map((s) => clone(s));
  let settings = clone(seedSettings);

  const findBooking = (id: string) => bookings.find((b) => b.id === id) ?? null;

  const asPublic = (session: AdminSession): PublicSession => toPublicSession(session);

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

  const emptyQueues = () => getMockRuntime().emptyAdminQueues;

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
            .map((session) => withFullOverlay(asPublic(session)));
        },
        { publicSessions: true },
      ),
    getPublicSession: (id) =>
      applyMockEffects(
        () => {
          const session = sessions.find((s) => s.id === id);
          return session ? withFullOverlay(asPublic(session)) : null;
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
      applyMockEffects(() => clone(acceptances[customerId] ?? [])),
    createCustomer: (input) =>
      applyMockEffects(() => {
        const profile = {
          id: `cust-${input.email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          fullName: input.fullName,
          email: input.email,
          contactNumber: input.contactNumber,
          authMethod: "email" as const,
        };
        profiles.push(profile);
        acceptances[profile.id] = [];
        return clone(profile);
      }),

    createBooking: ({ customerId, sessionId, policyAcceptances }) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) throw new Error("Session not found");
        const publicSession = asPublic(session);
        const waitlisted = session.remainingSlots <= 0;
        const created = {
          id: `booking-new-${sessionId}`,
          customerId,
          customerName:
            profiles.find((profile) => profile.id === customerId)?.fullName ?? "Studio guest",
          sessionId,
          status: waitlisted ? ("WAITLISTED" as const) : ("HELD_AWAITING_PAYMENT" as const),
          paymentMethod: null,
          paymentStatus: "NONE" as const,
          refundStatus: "NOT_APPLICABLE" as const,
          holdExpiresAt: waitlisted
            ? null
            : computeHoldExpiresAt(MOCK_NOW_ISO, session.startsAt).toISOString(),
          createdAt: MOCK_NOW_ISO,
          session: publicSession,
        };
        if (policyAcceptances?.length) {
          acceptances[customerId] = [...(acceptances[customerId] ?? []), ...policyAcceptances];
        }
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
      applyMockEffects(
        () => {
          const booking = findBooking(bookingId);
          if (!booking) throw new Error("Booking not found");
          booking.status = "PAYMENT_SUBMITTED";
          booking.paymentStatus = "PROOF_SUBMITTED";
          return clone(booking);
        },
        { proofUpload: true },
      ),
    getPaymentInstructions: () => applyMockEffects(() => clone(paymentInstructions)),
    createCancellationRequest: (bookingId, reason) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CANCELLATION_REQUESTED";
        booking.cancellationReason = reason ?? booking.cancellationReason ?? null;
        booking.requestCreatedAt = MOCK_NOW_ISO;
        return clone(booking);
      }),
    createRescheduleRequest: (bookingId, targetSessionId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        const target = sessions.find((s) => s.id === targetSessionId);
        booking.status = "RESCHEDULE_REQUESTED";
        booking.targetSessionId = targetSessionId;
        booking.targetSession = target ? asPublic(target) : null;
        booking.requestCreatedAt = MOCK_NOW_ISO;
        return clone(booking);
      }),

    getAdminBookings: (filters) =>
      applyMockEffects(() => {
        if (emptyQueues()) return [];
        return bookings.filter((booking) => {
          if (filters?.status && booking.status !== filters.status) return false;
          if (filters?.classId && booking.session.classId !== filters.classId) return false;
          if (filters?.date && manilaYmd(booking.session.startsAt) !== filters.date) return false;
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
        booking.paymentStatus =
          booking.paymentStatus === "NONE" ? "VERIFIED" : booking.paymentStatus;
        return clone(booking);
      }),
    rejectAdminBooking: (id, reason) =>
      applyMockEffects(() => {
        const booking = findBooking(id);
        if (!booking) throw new Error("Booking not found");
        booking.status = "REJECTED";
        booking.paymentStatus = "REJECTED";
        booking.rejectReason = reason;
        return clone(booking);
      }),
    getAdminPayments: ((query?: AdminPaymentQueueQuery) =>
      applyMockEffects(() => {
        if (query === undefined) {
          return emptyQueues() ? [] : bookings.map((b) => clone(b));
        }
        if (emptyQueues()) return EMPTY_CURSOR_PAGE;
        const tab = query.tab ?? "gcash";
        const sorted = sortPaymentTab(filterPaymentQueue(bookings, tab), tab).map((b) => clone(b));
        return sliceCursorPage(sorted, {
          sort: paymentQueueSort(tab),
          limit: query.limit,
          cursor: query.cursor,
          keyOf: paymentQueueKeyOf(tab),
        });
      })) as MockDataAdapter["getAdminPayments"],
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
      applyMockEffects(() => ({
        url: findBooking(bookingId)?.proofPreviewUrl ?? MOCK_PROOF_PREVIEW_URL,
      })),
    getAdminClasses: () => applyMockEffects(() => classes.map((c) => clone(c))),
    upsertAdminClass: (input) =>
      applyMockEffects(() => {
        if (input.id) {
          const existing = classes.find((c) => c.id === input.id);
          if (!existing) throw new Error("Class not found");
          Object.assign(existing, input);
          return clone(existing);
        }
        const created: AdminClass = {
          id: `class-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: input.name,
          shortDescription: input.shortDescription,
          defaultDurationMinutes: input.defaultDurationMinutes,
          defaultPricePhp: input.defaultPricePhp,
          active: input.active,
          associatedCoachIds: input.associatedCoachIds,
        };
        classes = [created, ...classes];
        return clone(created);
      }),
    getAdminCoaches: () => applyMockEffects(() => coaches.map((c) => clone(c))),
    upsertAdminCoach: (input) =>
      applyMockEffects(() => {
        if (input.id) {
          const existing = coaches.find((c) => c.id === input.id);
          if (!existing) throw new Error("Coach not found");
          existing.name = input.name;
          existing.specialties = input.specialties;
          existing.shortBio = input.shortBio;
          existing.photoKey = input.photoKey;
          existing.active = input.active;
          existing.defaultRatePhp = input.defaultRatePhp;
          existing.rateType = input.rateType;
          return clone(existing);
        }
        const created: AdminCoach = {
          id: `coach-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          ...input,
        };
        coaches = [created, ...coaches];
        return clone(created);
      }),
    getAdminSessions: () =>
      applyMockEffects(() => (emptyQueues() ? [] : sessions.map((s) => clone(s)))),
    upsertAdminSession: (input) =>
      applyMockEffects(() => {
        const cls = classes.find((c) => c.id === input.classId);
        const coach = coaches.find((c) => c.id === input.coachId);
        if (input.id) {
          const existing = sessions.find((s) => s.id === input.id);
          if (!existing) throw new Error("Session not found");
          const consumed = computeSessionInventory(
            existing,
            bookings.filter((b) => b.sessionId === existing.id),
          );
          const capacityCheck = validateSessionCapacity(
            input.capacity,
            consumed.confirmed + consumed.held,
          );
          if (!capacityCheck.ok) throw new Error(capacityCheck.error);
          Object.assign(existing, {
            classId: input.classId,
            className: cls?.name ?? existing.className,
            coachId: input.coachId,
            coachName: coach?.name ?? existing.coachName,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            pricePhp: input.pricePhp,
            capacity: input.capacity,
            bookable: input.bookable,
            reservable: input.bookable && input.status === "PUBLISHED",
            status: input.status,
            coachRatePhp: input.coachRatePhp,
            coachRateType: input.coachRateType,
          });
          return clone(existing);
        }
        const created: AdminSession = {
          id: `session-${input.startsAt.slice(0, 10)}-${input.classId}`,
          classId: input.classId,
          className: cls?.name ?? "Class",
          coachId: input.coachId,
          coachName: coach?.name ?? "Coach",
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          pricePhp: input.pricePhp,
          capacity: input.capacity,
          remainingSlots: input.capacity,
          reservable: input.bookable && input.status === "PUBLISHED",
          availability: "open",
          status: input.status,
          bookable: input.bookable,
          coachRatePhp: input.coachRatePhp,
          coachRateType: input.coachRateType,
        };
        sessions = [created, ...sessions];
        return clone(created);
      }),
    cancelAdminSession: (id) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === id);
        if (!session) throw new Error("Session not found");
        session.status = "CANCELLED";
        session.availability = "cancelled";
        session.reservable = false;
        session.bookable = false;
        return clone(session);
      }),
    getAdminCancellationRequests: ((query?: AdminRequestQueueQuery) =>
      applyMockEffects(() => {
        if (query === undefined) {
          return emptyQueues() ? [] : bookings.filter((b) => b.status === "CANCELLATION_REQUESTED");
        }
        if (emptyQueues()) return EMPTY_CURSOR_PAGE;
        const sorted = sortRequestQueue(
          bookings.filter((b) => b.status === "CANCELLATION_REQUESTED"),
        ).map((b) => clone(b));
        return sliceCursorPage(sorted, {
          sort: ADMIN_REQUEST_QUEUE_SORT,
          limit: query.limit,
          cursor: query.cursor,
          keyOf: requestQueueKey,
        });
      })) as MockDataAdapter["getAdminCancellationRequests"],
    completeAdminCancellation: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CANCELLED";
        const session = sessions.find((s) => s.id === booking.sessionId);
        if (session) session.remainingSlots += 1;
        return clone(booking);
      }),
    rejectAdminCancellation: (bookingId, reason) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CONFIRMED";
        booking.rejectReason = reason;
        return clone(booking);
      }),
    getAdminRescheduleRequests: ((query?: AdminRequestQueueQuery) =>
      applyMockEffects(() => {
        if (query === undefined) {
          return emptyQueues() ? [] : bookings.filter((b) => b.status === "RESCHEDULE_REQUESTED");
        }
        if (emptyQueues()) return EMPTY_CURSOR_PAGE;
        const sorted = sortRequestQueue(
          bookings.filter((b) => b.status === "RESCHEDULE_REQUESTED"),
        ).map((b) => clone(b));
        return sliceCursorPage(sorted, {
          sort: ADMIN_REQUEST_QUEUE_SORT,
          limit: query.limit,
          cursor: query.cursor,
          keyOf: requestQueueKey,
        });
      })) as MockDataAdapter["getAdminRescheduleRequests"],
    approveAdminReschedule: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        const target = sessions.find((s) => s.id === booking.targetSessionId);
        if (!target) throw new Error("Requested session not found");
        const allowed = canApproveReschedule(target);
        if (!allowed.ok) throw new Error(allowed.error);
        booking.sessionId = target.id;
        booking.session = asPublic(target);
        booking.status = "CONFIRMED";
        target.remainingSlots = Math.max(0, target.remainingSlots - 1);
        return clone(booking);
      }),
    rejectAdminReschedule: (bookingId, reason) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "CONFIRMED";
        booking.rejectReason = reason;
        return clone(booking);
      }),
    getAdminSessionRoster: (sessionId) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) throw new Error("Session not found");
        const rows = bookings.filter((b) => b.sessionId === sessionId);
        const confirmed = rows.filter((b) => b.status === "CONFIRMED" || b.status === "CHECKED_IN");
        const held = rows.filter(
          (b) =>
            b.status === "HELD_AWAITING_PAYMENT" ||
            b.status === "PAYMENT_SUBMITTED" ||
            b.status === "CANCELLATION_REQUESTED" ||
            b.status === "RESCHEDULE_REQUESTED",
        );
        const waitlisted = rows
          .filter((b) => b.status === "WAITLISTED")
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const inventory = computeSessionInventory(session, rows);
        return {
          session: clone(session),
          confirmed,
          held,
          waitlisted,
          capacity: session.capacity,
          confirmedCount: inventory.confirmed,
          heldCount: inventory.held,
          available: inventory.available,
          waitlistedCount: inventory.waitlisted,
          checkedIn: inventory.checkedIn,
          noShow: inventory.noShow,
          occupancy: inventory.confirmed / Math.max(1, session.capacity),
          attendanceUtilisation: inventory.checkedIn / Math.max(1, session.capacity),
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
        const reports = computeAdminReports(sessions, bookings, {
          from: "2020-01-01",
          to: "2030-12-31",
        });
        void formatPeso(reports.overview.grossSalesPhp);
        return {
          grossPhp: reports.overview.grossSalesPhp,
          refundsPhp: reports.overview.refundsPhp,
          netPhp: reports.overview.netSalesPhp,
        };
      }),
    getAdminReports: (filters) =>
      applyMockEffects(() => computeAdminReports(sessions, bookings, filters)),
    getAdminSessionReport: (sessionId) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return null;
        return computeSessionDrilldown(session, bookings);
      }),
    getAdminStaff: () =>
      applyMockEffects(() => (emptyQueues() ? [] : staffRows.map((s) => clone(s)))),
    upsertAdminStaff: (input) =>
      applyMockEffects(() => {
        if (input.id) {
          const existing = staffRows.find((s) => s.id === input.id);
          if (!existing) throw new Error("Staff not found");
          Object.assign(existing, input);
          return clone(existing);
        }
        const created = {
          id: `staff-${input.email.split("@")[0]}`,
          name: input.name,
          email: input.email,
          role: input.role,
          status: input.status,
        };
        staffRows = [created, ...staffRows];
        return clone(created);
      }),
    disableAdminStaff: (id) =>
      applyMockEffects(() => {
        const existing = staffRows.find((s) => s.id === id);
        if (!existing) throw new Error("Staff not found");
        existing.status = "disabled";
        return clone(existing);
      }),
    getAdminCustomers: (filters) =>
      applyMockEffects(() => {
        const rows = profiles.map((p) => buildAdminCustomerRow(p, bookings));
        return rows.filter((row) => {
          if (filters?.hasUpcoming && row.upcomingCount === 0) return false;
          if (filters?.query) {
            const q = filters.query.toLowerCase();
            if (
              !row.fullName.toLowerCase().includes(q) &&
              !row.email.toLowerCase().includes(q) &&
              !row.contactNumber.toLowerCase().includes(q)
            ) {
              return false;
            }
          }
          return true;
        });
      }),
    getAdminCustomer: (id) =>
      applyMockEffects(() => {
        const profile = profiles.find((p) => p.id === id);
        if (!profile) return null;
        const mine = bookings.filter((b) => b.customerId === id);
        const row = buildAdminCustomerRow(profile, bookings);
        return {
          ...row,
          upcoming: mine.filter((b) => bookingListTab(b.status) === "upcoming"),
          pending: mine.filter((b) => bookingListTab(b.status) === "pending"),
          history: mine.filter((b) => bookingListTab(b.status) === "history"),
          requestHistory: mine.filter(
            (b) =>
              b.status === "CANCELLATION_REQUESTED" ||
              b.status === "RESCHEDULE_REQUESTED" ||
              b.status === "CANCELLED",
          ),
          attendanceHistory: mine.filter(
            (b) => b.status === "CHECKED_IN" || b.status === "NO_SHOW" || b.status === "COMPLETED",
          ),
          paymentHistory: mine.filter(
            (b) => b.paymentStatus !== "NONE" || b.refundStatus !== "NOT_APPLICABLE",
          ),
          policyAcceptances: clone(acceptances[id] ?? []),
        };
      }),
    getAdminSettings: () => applyMockEffects(() => clone(settings)),
    updateAdminSettings: (patch) =>
      applyMockEffects(() => {
        settings = { ...settings, ...patch, contact: { ...settings.contact, ...patch.contact } };
        return clone(settings);
      }),
    promotePolicyVersion: (documentName, version) =>
      applyMockEffects(() => {
        settings.policyDocuments = settings.policyDocuments.map((doc) =>
          doc.documentName === documentName ? { ...doc, current: false } : doc,
        );
        settings.policyDocuments.push({
          id: `policy-${documentName.toLowerCase()}-${version}`,
          documentName,
          version,
          promotedAt: MOCK_NOW_ISO,
          current: true,
        });
        return clone(settings);
      }),
    getAdminDashboard: () =>
      applyMockEffects(() => {
        const snap = buildAdminDashboard(sessions, bookings, manilaYmd(MOCK_NOW_ISO));
        if (emptyQueues()) {
          return {
            ...snap,
            pendingPayments: 0,
            cancellations: 0,
            reschedules: 0,
            waitlisted: 0,
            attention: { payments: 0, cancellations: 0, reschedules: 0 },
            todaysSchedule: [],
          };
        }
        return snap;
      }),
  };
}

export const mockAdapter = createMemoryAdapter();

export function getMockAdapter(): MockDataAdapter {
  return mockAdapter;
}

export { toPublicCoach };
