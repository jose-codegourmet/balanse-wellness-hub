import type {
  AdminClass,
  AdminCoach,
  AdminPaymentTab,
  AdminSession,
  AdminSettings,
  AdminStaff,
  CursorPage,
  CustomerBooking,
  PaymentMethod,
  PaymentQrCode,
  PolicyAcceptance,
  PolicyDocumentVersion,
  PublicSession,
} from "@balanse/domain";
import {
  ADMIN_PAYMENT_HOLD_SORT,
  ADMIN_PAYMENT_REFUND_SORT,
  ADMIN_REQUEST_QUEUE_SORT,
  addCalendarDays,
  bookingListTab,
  buildAdminCustomerRow,
  buildAdminDashboard,
  calendarDayDistance,
  canApproveReschedule,
  computeAdminReports,
  computeHoldExpiresAt,
  computeSessionDrilldown,
  computeSessionInventory,
  datesForWeeklyRecurrence,
  FIELD_CONSTRAINTS,
  filterPaymentQueue,
  formatPeso,
  manilaYmd,
  sessionCoachCost,
  shiftSessionIsoToDate,
  sliceCursorPage,
  toPublicSession,
  validateSessionCapacity,
} from "@balanse/domain";
import type { AdminPaymentQueueQuery, AdminRequestQueueQuery, MockDataAdapter } from "./adapter";
import { applyAdminAuthorization } from "./apply-admin-authorization";
import type { BundleState } from "./bundle-engine";
import {
  approveAcquisition,
  claimFreeBundle,
  consumeCredit,
  grantCustomerBundle,
  holdCredit,
  listEligible,
  listPublishedBundles,
  markPromotionBlocked,
  materializeEntitlement,
  moveRedemption,
  rejectAcquisition,
  requestPaidBundle,
  restoreCredit,
  revokeEntitlement,
  setBundleStatus,
  toPublicBundle,
  upsertBundle,
} from "./bundle-engine";
import {
  bundleAcquisitions,
  bundleAudits,
  bundleDefinitions,
  bundleRedemptions,
  customerEntitlements,
} from "./bundle-fixtures";
import { deriveGrossSalesSeries } from "./dashboard-series";
import {
  customers,
  MOCK_NOW_ISO,
  MOCK_PROOF_PREVIEW_URL,
  paymentInstructions,
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

function currentBody(docs: PolicyDocumentVersion[], name: string): string {
  return docs.find((doc) => doc.documentName === name && doc.current)?.body ?? "";
}

function livePaymentQrs(settings: AdminSettings): PaymentQrCode[] {
  return (settings.paymentQrs ?? []).filter((row) => row.archivedAt === null);
}

function syncDerivedQr(settings: AdminSettings): void {
  const rows = settings.paymentQrs ?? [];
  if (rows.length === 0 && settings.qrImageKey) {
    const now = MOCK_NOW_ISO;
    settings.paymentQrs = [
      {
        id: "pqr-legacy",
        label: "GCash — main",
        imageKey: settings.qrImageKey,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
      },
    ];
  }
  const active = livePaymentQrs(settings).find((row) => row.isActive) ?? null;
  settings.qrImageKey = active?.imageKey ?? null;
}

export function createMemoryAdapter(): MockDataAdapter {
  let bookings = seedBookings.map((b) => clone(b));
  let sessions = seedSessions.map((s) => clone(s));
  const profiles = customers.map((c) => clone(c));
  const acceptances: Record<string, PolicyAcceptance[]> = clone(seedAcceptances);
  let classes = seedClasses.map((c) => clone(c));
  let coaches = seedCoaches.map((c) => clone(c));
  let staffRows = seedStaff.map((s) => clone(s));
  let settings = clone(seedSettings);
  const bundleState: BundleState = {
    bundles: clone(bundleDefinitions),
    acquisitions: clone(bundleAcquisitions),
    entitlements: clone(customerEntitlements),
    redemptions: clone(bundleRedemptions),
    audits: clone(bundleAudits),
  };

  function decorateBooking(booking: CustomerBooking): CustomerBooking {
    const redemption = bundleState.redemptions.find(
      (row) => row.bookingId === booking.id && row.status !== "RESTORED",
    );
    if (!redemption) return booking;
    const entitlement = bundleState.entitlements.find((row) => row.id === redemption.entitlementId);
    booking.entitlementId = redemption.entitlementId;
    booking.packageName = entitlement?.snapshot.name ?? booking.packageName ?? null;
    return booking;
  }

  function promoteWaitlisted(booking: CustomerBooking): CustomerBooking {
    const session = sessions.find((row) => row.id === booking.sessionId);
    if (!session) throw new Error("Session not found");
    const intendedId = booking.intendedEntitlementId;
    if (intendedId) {
      try {
        holdCredit(bundleState, {
          customerId: booking.customerId,
          entitlementId: intendedId,
          booking,
          session: asPublic(session),
        });
        booking.entitlementId = intendedId;
        booking.intendedEntitlementId = null;
        booking.packagePromotionBlocked = false;
        booking.status = "PAYMENT_SUBMITTED";
        booking.paymentStatus = "VERIFIED";
        booking.holdExpiresAt = null;
        const entitlement = bundleState.entitlements.find((row) => row.id === intendedId);
        booking.packageName = entitlement?.snapshot.name ?? booking.packageName ?? null;
        return decorateBooking(booking);
      } catch (error) {
        markPromotionBlocked(
          bundleState,
          booking,
          error instanceof Error
            ? error.message
            : "The intended package could not be reserved. The customer stays on the waitlist.",
        );
        return booking;
      }
    }
    booking.status = "HELD_AWAITING_PAYMENT";
    booking.holdExpiresAt = computeHoldExpiresAt(MOCK_NOW_ISO, session.startsAt).toISOString();
    return booking;
  }

  function slugPerson(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "coach"
    );
  }

  function unlinkStaffCoach(staff: AdminStaff) {
    const coach = staff.coachId ? coaches.find((row) => row.id === staff.coachId) : undefined;
    if (coach) {
      coach.staffId = null;
      // FE-ADM-038: never delete a teaching profile; keep session history via inactive coach.
      coach.active = false;
    }
    staff.isCoach = false;
    staff.coachId = null;
  }

  function linkStaffCoach(staff: AdminStaff) {
    if (staff.coachId) {
      const existing = coaches.find((row) => row.id === staff.coachId);
      if (existing) {
        if (existing.staffId && existing.staffId !== staff.id) {
          throw new Error("This coach is already linked to a staff member.");
        }
        existing.staffId = staff.id;
        existing.active = true;
        staff.isCoach = true;
        staff.coachId = existing.id;
        return;
      }
    }
    const byName = coaches.find(
      (row) => !row.staffId && row.name.trim().toLowerCase() === staff.name.trim().toLowerCase(),
    );
    if (byName) {
      byName.staffId = staff.id;
      byName.active = true;
      staff.isCoach = true;
      staff.coachId = byName.id;
      return;
    }
    let id = `coach-${slugPerson(staff.name)}`;
    if (coaches.some((row) => row.id === id)) {
      id = `coach-${slugPerson(staff.name)}-${staff.id.replace(/^staff-/, "")}`;
    }
    const created: AdminCoach = {
      id,
      name: staff.name,
      specialties: [],
      shortBio: "",
      photoKey: null,
      active: true,
      defaultRatePhp: 0,
      rateType: "PER_SESSION",
      staffId: staff.id,
    };
    coaches = [created, ...coaches];
    staff.isCoach = true;
    staff.coachId = created.id;
  }
  settings.paymentQrs = settings.paymentQrs ?? [];
  syncDerivedQr(settings);

  const findBooking = (id: string) => bookings.find((b) => b.id === id) ?? null;

  const asPublic = (session: AdminSession): PublicSession => toPublicSession(session);

  function createGeneratedSession(
    template: AdminSession,
    startsAt: string,
    publish: boolean,
    recurrenceRuleId: string | null,
  ): AdminSession {
    const durationMs = Date.parse(template.endsAt) - Date.parse(template.startsAt);
    const endsAt = new Date(Date.parse(startsAt) + durationMs).toISOString();
    const assigned = template.coaches.map((assignedCoach) => {
      const coach = coaches.find((row) => row.id === assignedCoach.id);
      if (!coach) throw new Error("One or more assigned coaches no longer exist.");
      return coach;
    });
    const coachAssignments = assigned.map((coach) => ({
      coachId: coach.id,
      coachRatePhp: coach.defaultRatePhp,
      coachRateType: coach.rateType,
    }));
    const generated: AdminSession = {
      id: `session-${crypto.randomUUID()}`,
      classId: template.classId,
      name: template.name ?? null,
      className: template.className,
      coaches: assigned.map(({ id, name, photoKey }) => ({ id, name, photoKey })),
      coachName: assigned.map((coach) => coach.name).join(", "),
      coachAssignments,
      coachRatePhp: coachAssignments.reduce(
        (sum, assignment) =>
          sum +
          sessionCoachCost(assignment, {
            startsAt,
            endsAt,
          }),
        0,
      ),
      startsAt,
      endsAt,
      pricePhp: template.pricePhp,
      capacity: template.capacity,
      remainingSlots: template.capacity,
      reservable: publish,
      availability: "open",
      status: publish ? "PUBLISHED" : "DRAFT",
      bookable: publish,
      recurrenceRuleId,
    };
    return generated;
  }

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

  return applyAdminAuthorization({
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
    getPublicCoaches: () =>
      applyMockEffects(() => coaches.filter((c) => c.active).map(toPublicCoach)),
    getPublicClasses: () =>
      applyMockEffects(() => classes.filter((c) => c.active).map((c) => clone(c))),
    getPublicContent: () => applyMockEffects(() => clone(publicContent)),
    getPublicBundles: () => applyMockEffects(() => clone(listPublishedBundles(bundleState))),
    getPublicBundle: (slugOrId) =>
      applyMockEffects(() => {
        const bundle = bundleState.bundles.find(
          (row) => row.slug === slugOrId || row.id === slugOrId,
        );
        if (bundle?.status !== "PUBLISHED") return null;
        return clone(toPublicBundle(bundle));
      }),

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

    getMyEntitlements: (customerId) =>
      applyMockEffects(() =>
        bundleState.entitlements
          .filter((row) => row.customerId === customerId)
          .map((row) => clone(materializeEntitlement(bundleState, row))),
      ),
    getMyEntitlement: (customerId, entitlementId) =>
      applyMockEffects(() => {
        const entitlement = bundleState.entitlements.find(
          (row) => row.id === entitlementId && row.customerId === customerId,
        );
        return entitlement ? clone(materializeEntitlement(bundleState, entitlement)) : null;
      }),
    getMyAcquisitions: (customerId) =>
      applyMockEffects(() =>
        bundleState.acquisitions
          .filter((row) => row.customerId === customerId)
          .map((row) => clone(row)),
      ),
    getEligibleEntitlements: (customerId, sessionId) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) return [];
        return clone(listEligible(bundleState, customerId, asPublic(session)));
      }),
    getEntitlementRedemptions: (customerId, entitlementId) =>
      applyMockEffects(() => {
        const entitlement = bundleState.entitlements.find(
          (row) => row.id === entitlementId && row.customerId === customerId,
        );
        if (!entitlement) return [];
        return bundleState.redemptions
          .filter((row) => row.entitlementId === entitlementId)
          .map((row) => clone(row));
      }),
    claimFreeBundle: (input) => applyMockEffects(() => clone(claimFreeBundle(bundleState, input))),
    requestPaidBundle: (input) =>
      applyMockEffects(() => clone(requestPaidBundle(bundleState, input))),
    createBooking: ({
      customerId,
      sessionId,
      policyAcceptances,
      entitlementId,
      intendedEntitlementId,
    }) =>
      applyMockEffects(() => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) throw new Error("Session not found");
        const publicSession = asPublic(session);
        const waitlisted = session.remainingSlots <= 0;
        const packageId = entitlementId ?? intendedEntitlementId ?? null;
        const entitlement = packageId
          ? bundleState.entitlements.find((row) => row.id === packageId)
          : null;
        const created: CustomerBooking = {
          id: `booking-new-${sessionId}-${customerId}`,
          customerId,
          customerName:
            profiles.find((profile) => profile.id === customerId)?.fullName ?? "Studio guest",
          sessionId,
          status: waitlisted
            ? "WAITLISTED"
            : packageId
              ? "PAYMENT_SUBMITTED"
              : "HELD_AWAITING_PAYMENT",
          paymentMethod: null,
          paymentStatus: packageId && !waitlisted ? "VERIFIED" : "NONE",
          refundStatus: "NOT_APPLICABLE",
          holdExpiresAt:
            waitlisted || packageId
              ? null
              : computeHoldExpiresAt(MOCK_NOW_ISO, session.startsAt).toISOString(),
          createdAt: MOCK_NOW_ISO,
          session: publicSession,
          entitlementId: waitlisted ? null : packageId,
          intendedEntitlementId: waitlisted ? packageId : null,
          packageName: entitlement?.snapshot.name ?? null,
        };
        if (policyAcceptances?.length) {
          acceptances[customerId] = [...(acceptances[customerId] ?? []), ...policyAcceptances];
        }
        if (waitlisted) {
          bookings = [created, ...bookings];
          return clone(created);
        }
        if (packageId) {
          holdCredit(bundleState, {
            customerId,
            entitlementId: packageId,
            booking: created,
            session: publicSession,
          });
        }
        bookings = [created, ...bookings];
        return clone(decorateBooking(created));
      }),
    getBookings: (customerId) =>
      applyMockEffects(() =>
        bookings.filter((b) => b.customerId === customerId).map((b) => clone(decorateBooking(b))),
      ),
    getBooking: (id) =>
      applyMockEffects(() => {
        const booking = findBooking(id);
        return booking ? clone(decorateBooking(booking)) : null;
      }),
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
    getPaymentInstructions: () =>
      applyMockEffects(() => {
        syncDerivedQr(settings);
        return clone({
          ...paymentInstructions,
          gcashName: settings.gcashName,
          gcashNumber: settings.gcashNumber,
          qrImageKey: settings.qrImageKey,
        });
      }),
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
        consumeCredit(bundleState, booking.id);
        return clone(decorateBooking(booking));
      }),
    rejectAdminBooking: (id, reason) =>
      applyMockEffects(() => {
        const booking = findBooking(id);
        if (!booking) throw new Error("Booking not found");
        booking.status = "REJECTED";
        booking.paymentStatus = "REJECTED";
        booking.rejectReason = reason;
        restoreCredit(bundleState, booking.id, reason);
        return clone(decorateBooking(booking));
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
        if (classes.some((row) => row.id !== input.id && row.slug === input.slug))
          throw new Error("That class page URL is already in use.");
        if (input.coachIds.some((id) => !coaches.some((coach) => coach.id === id)))
          throw new Error("Choose valid coaches.");
        if (input.id) {
          const existing = classes.find((c) => c.id === input.id);
          if (!existing) throw new Error("Class not found");
          Object.assign(existing, input);
          for (const session of sessions)
            if (session.classId === existing.id) session.className = existing.name;
          for (const booking of bookings)
            if (booking.session.classId === existing.id) booking.session.className = existing.name;
          return clone(existing);
        }
        const created: AdminClass = {
          id: `class-${input.slug}-${crypto.randomUUID()}`,
          name: input.name,
          slug: input.slug,
          customPageUrl: input.customPageUrl ?? null,
          description: input.description,
          coachIds: [...input.coachIds],
          heroImage: input.heroImage,
          galleryImages: [...input.galleryImages],
          shortDescription: input.shortDescription,
          defaultDurationMinutes: input.defaultDurationMinutes,
          defaultPricePhp: input.defaultPricePhp,
          active: input.active,
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
          staffId: null,
        };
        coaches = [created, ...coaches];
        return clone(created);
      }),
    getAdminSessions: () =>
      applyMockEffects(() => (emptyQueues() ? [] : sessions.map((s) => clone(s)))),
    upsertAdminSession: (input) =>
      applyMockEffects(() => {
        const cls = classes.find((c) => c.id === input.classId);
        const previous = sessions.find((s) => s.id === input.id);
        if (!cls || (!cls.active && previous?.classId !== cls.id))
          throw new Error("Choose an active class.");
        if (!Array.isArray(input.coachIds) || input.coachIds.length === 0)
          throw new Error("Choose at least one coach.");
        if (new Set(input.coachIds).size !== input.coachIds.length)
          throw new Error("Choose each coach only once.");
        const assigned = input.coachIds.map((id) => {
          const coach = coaches.find((row) => row.id === id);
          if (!coach || (!coach.active && !previous?.coaches.some((row) => row.id === id)))
            throw new Error("Choose active coaches.");
          return coach;
        });
        const coachAssignments = assigned.map(
          (coach) =>
            previous?.coachAssignments.find((row) => row.coachId === coach.id) ?? {
              coachId: coach.id,
              coachRatePhp: coach.defaultRatePhp,
              coachRateType: coach.rateType,
            },
        );
        const coachFields = {
          coaches: assigned.map(({ id, name, photoKey }) => ({ id, name, photoKey })),
          coachName: assigned.map((coach) => coach.name).join(", "),
          coachAssignments,
          coachRatePhp: coachAssignments.reduce(
            (sum, row) => sum + sessionCoachCost(row, input),
            0,
          ),
        };
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
            name: input.name === undefined ? existing.name : input.name?.trim() || null,
            className: cls?.name ?? existing.className,
            ...coachFields,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            pricePhp: input.pricePhp,
            capacity: input.capacity,
            bookable: input.bookable,
            reservable: input.bookable && input.status === "PUBLISHED",
            status: input.status,
          });
          for (const booking of bookings.filter((row) => row.sessionId === existing.id))
            booking.session = asPublic(existing);
          return clone(existing);
        }
        const created: AdminSession = {
          id: `session-${crypto.randomUUID()}`,
          classId: input.classId,
          name: input.name?.trim() || null,
          className: cls?.name ?? "Class",
          ...coachFields,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          pricePhp: input.pricePhp,
          capacity: input.capacity,
          remainingSlots: input.capacity,
          reservable: input.bookable && input.status === "PUBLISHED",
          availability: "open",
          status: input.status,
          bookable: input.bookable,
        };
        sessions = [created, ...sessions];
        return clone(created);
      }),
    duplicateAdminSchedule: (input) =>
      applyMockEffects(() => {
        const dayOffset = calendarDayDistance(input.sourceStart, input.targetStart);
        const templates = sessions.filter((session) => {
          const ymd = manilaYmd(session.startsAt);
          return (
            ymd >= input.sourceStart && ymd <= input.sourceEnd && session.status !== "CANCELLED"
          );
        });
        const created: AdminSession[] = [];
        let skippedCount = 0;
        for (const template of templates) {
          const targetYmd = addCalendarDays(manilaYmd(template.startsAt), dayOffset);
          const startsAt = shiftSessionIsoToDate(template.startsAt, targetYmd);
          if (
            sessions.some(
              (session) => session.classId === template.classId && session.startsAt === startsAt,
            )
          ) {
            skippedCount += 1;
            continue;
          }
          created.push(createGeneratedSession(template, startsAt, input.publish, null));
        }
        sessions = [...created, ...sessions];
        return {
          createdCount: created.length,
          skippedCount,
          sessionIds: created.map((session) => session.id),
        };
      }),
    createAdminRecurringSchedule: (input) =>
      applyMockEffects(() => {
        const template = sessions.find((session) => session.id === input.sourceSessionId);
        if (!template) throw new Error("Session not found");
        if (template.status === "CANCELLED") throw new Error("Cancelled sessions cannot repeat.");
        if (template.recurrenceRuleId) throw new Error("This session is already recurring.");
        const recurrenceRuleId = `recurrence-${crypto.randomUUID()}`;
        template.recurrenceRuleId = recurrenceRuleId;
        const created: AdminSession[] = [];
        let skippedCount = 0;
        for (const ymd of datesForWeeklyRecurrence(input)) {
          const startsAt = shiftSessionIsoToDate(template.startsAt, ymd);
          if (
            sessions.some(
              (session) => session.classId === template.classId && session.startsAt === startsAt,
            )
          ) {
            skippedCount += 1;
            continue;
          }
          created.push(createGeneratedSession(template, startsAt, input.publish, recurrenceRuleId));
        }
        sessions = [...created, ...sessions];
        return {
          createdCount: created.length,
          skippedCount,
          sessionIds: created.map((session) => session.id),
          recurrenceRuleId,
        };
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
        restoreCredit(bundleState, booking.id, "Eligible cancellation completed");
        const nextWaitlisted = bookings
          .filter((row) => row.sessionId === booking.sessionId && row.status === "WAITLISTED")
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
        if (nextWaitlisted) promoteWaitlisted(nextWaitlisted);
        return clone(decorateBooking(booking));
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
        moveRedemption(bundleState, booking, asPublic(target));
        consumeCredit(bundleState, booking.id);
        return clone(decorateBooking(booking));
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
        consumeCredit(bundleState, booking.id);
        return clone(decorateBooking(booking));
      }),
    markNoShow: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "NO_SHOW";
        consumeCredit(bundleState, booking.id);
        return clone(decorateBooking(booking));
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
          existing.name = input.name;
          existing.email = input.email;
          existing.role = input.role;
          existing.status = input.status;
          if (input.isCoach === true) {
            linkStaffCoach(existing);
          } else if (input.isCoach === false) {
            unlinkStaffCoach(existing);
          }
          return clone(existing);
        }
        const created = {
          id: `staff-${input.email.split("@")[0]}`,
          name: input.name,
          email: input.email,
          role: input.role,
          status: input.status,
          isCoach: false,
          coachId: null,
        };
        if (input.isCoach) {
          linkStaffCoach(created);
        }
        staffRows = [created, ...staffRows];
        return clone(created);
      }),
    disableAdminStaff: (id) =>
      applyMockEffects(() => {
        const existing = staffRows.find((s) => s.id === id);
        if (!existing) throw new Error("Staff not found");
        existing.status = "disabled";
        if (existing.coachId) {
          const coach = coaches.find((row) => row.id === existing.coachId);
          if (coach) coach.active = false;
        }
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
          entitlements: bundleState.entitlements
            .filter((row) => row.customerId === id)
            .map((row) => clone(materializeEntitlement(bundleState, row))),
          acquisitions: bundleState.acquisitions
            .filter((row) => row.customerId === id)
            .map((row) => clone(row)),
        };
      }),
    getAdminSettings: () =>
      applyMockEffects(() => {
        syncDerivedQr(settings);
        return clone(settings);
      }),
    updateAdminSettings: (patch) =>
      applyMockEffects(() => {
        const nextKey = patch.qrImageKey;
        settings = { ...settings, ...patch, contact: { ...settings.contact, ...patch.contact } };
        if (nextKey && !livePaymentQrs(settings).some((row) => row.imageKey === nextKey)) {
          settings.qrImageKey = nextKey;
        }
        syncDerivedQr(settings);
        return clone(settings);
      }),
    listPaymentQrs: (includeArchived = false) =>
      applyMockEffects(() => {
        syncDerivedQr(settings);
        const items = (settings.paymentQrs ?? []).filter(
          (row) => includeArchived || row.archivedAt === null,
        );
        const activeId = items.find((row) => row.isActive && row.archivedAt === null)?.id ?? null;
        return clone({ items, activeId });
      }),
    upsertPaymentQr: (input) =>
      applyMockEffects(() => {
        syncDerivedQr(settings);
        const rows = settings.paymentQrs ?? [];
        if (input.id) {
          const current = rows.find((row) => row.id === input.id);
          if (!current || current.archivedAt) throw new Error("payment_qr_not_found");
          current.label = input.label;
          current.imageKey = input.imageKey;
          current.updatedAt = MOCK_NOW_ISO;
          syncDerivedQr(settings);
          return clone(current);
        }
        const live = livePaymentQrs(settings);
        if (live.length >= FIELD_CONSTRAINTS.settings.paymentQr.maxItems) {
          throw new Error("qr_limit");
        }
        const created: PaymentQrCode = {
          id: `pqr-${globalThis.crypto?.randomUUID?.() ?? String(rows.length + 1)}`,
          label: input.label,
          imageKey: input.imageKey,
          isActive: live.length === 0,
          createdAt: MOCK_NOW_ISO,
          updatedAt: MOCK_NOW_ISO,
          archivedAt: null,
        };
        settings.paymentQrs = [...rows, created];
        syncDerivedQr(settings);
        return clone(created);
      }),
    activatePaymentQr: (id) =>
      applyMockEffects(() => {
        const rows = settings.paymentQrs ?? [];
        const current = rows.find((row) => row.id === id);
        if (!current || current.archivedAt) throw new Error("payment_qr_not_found");
        for (const row of rows) {
          row.isActive = row.id === id;
          if (row.id === id) row.updatedAt = MOCK_NOW_ISO;
        }
        syncDerivedQr(settings);
        return clone(current);
      }),
    archivePaymentQr: (id) =>
      applyMockEffects(() => {
        const current = (settings.paymentQrs ?? []).find((row) => row.id === id);
        if (!current || current.archivedAt) throw new Error("payment_qr_not_found");
        if (current.isActive) throw new Error("cannot_remove_active");
        current.archivedAt = MOCK_NOW_ISO;
        current.isActive = false;
        current.updatedAt = MOCK_NOW_ISO;
        syncDerivedQr(settings);
        return clone(current);
      }),
    upsertPolicyDocument: (input) =>
      applyMockEffects(() => {
        const existing = input.id
          ? settings.policyDocuments.find((doc) => doc.id === input.id)
          : undefined;
        if (existing) {
          existing.documentName = input.documentName.trim();
          existing.version = input.version.trim();
          existing.body = input.body;
          if (input.current)
            settings.policyDocuments = settings.policyDocuments.map((doc) => ({
              ...doc,
              current: doc.id === existing.id,
            }));
          return clone(existing);
        }
        const created = {
          id: `policy-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
          documentName: input.documentName.trim(),
          version: input.version.trim(),
          promotedAt: MOCK_NOW_ISO,
          current: input.current ?? false,
          body: input.body,
        };
        settings.policyDocuments.push(created);
        return clone(created);
      }),
    deletePolicyDocument: (id) =>
      applyMockEffects(() => {
        const target = settings.policyDocuments.find((doc) => doc.id === id);
        if (!target) throw new Error("policy_not_found");
        if (target.current) throw new Error("cannot_delete_current_policy");
        settings.policyDocuments = settings.policyDocuments.filter((doc) => doc.id !== id);
        return clone(settings);
      }),
    promotePolicyVersion: (documentName, version) =>
      applyMockEffects(() => {
        const body = currentBody(settings.policyDocuments, documentName);
        settings.policyDocuments = settings.policyDocuments.map((doc) => {
          return doc.documentName === documentName ? { ...doc, current: false } : doc;
        });
        settings.policyDocuments.push({
          id: `policy-${documentName.toLowerCase()}-${version}`,
          documentName,
          version,
          promotedAt: MOCK_NOW_ISO,
          current: true,
          body,
        });
        return clone(settings);
      }),
    getAdminDashboard: () =>
      applyMockEffects(() => {
        const todayYmd = manilaYmd(MOCK_NOW_ISO);
        const snap = buildAdminDashboard(sessions, bookings, todayYmd);
        const series = {
          gross_sales: deriveGrossSalesSeries(sessions, bookings, todayYmd),
        };
        if (emptyQueues()) {
          return {
            ...snap,
            pendingPayments: 0,
            cancellations: 0,
            reschedules: 0,
            waitlisted: 0,
            attention: { payments: 0, cancellations: 0, reschedules: 0 },
            todaysSchedule: [],
            series,
          };
        }
        return { ...snap, series };
      }),
    getAdminBundles: () => applyMockEffects(() => clone(bundleState.bundles)),
    getAdminBundle: (id) =>
      applyMockEffects(() => clone(bundleState.bundles.find((row) => row.id === id) ?? null)),
    upsertAdminBundle: (input) => applyMockEffects(() => clone(upsertBundle(bundleState, input))),
    setAdminBundleStatus: (id, status) =>
      applyMockEffects(() => clone(setBundleStatus(bundleState, id, status))),
    grantCustomerBundle: (input) =>
      applyMockEffects(() => clone(grantCustomerBundle(bundleState, input))),
    revokeCustomerEntitlement: (input) =>
      applyMockEffects(() => clone(revokeEntitlement(bundleState, input))),
    getAdminBundleAcquisitions: (status) =>
      applyMockEffects(() =>
        clone(bundleState.acquisitions.filter((row) => (status ? row.status === status : true))),
      ),
    approveBundleAcquisition: (id, actorId) =>
      applyMockEffects(() => clone(approveAcquisition(bundleState, id, actorId))),
    rejectBundleAcquisition: (id, reason, actorId) =>
      applyMockEffects(() => clone(rejectAcquisition(bundleState, id, reason, actorId))),
    getAdminCustomerEntitlements: (customerId) =>
      applyMockEffects(() =>
        bundleState.entitlements
          .filter((row) => row.customerId === customerId)
          .map((row) => clone(materializeEntitlement(bundleState, row))),
      ),
    getBundleAudit: (query) =>
      applyMockEffects(() =>
        clone(
          bundleState.audits.filter((row) => {
            if (query?.entitlementId && row.entitlementId !== query.entitlementId) return false;
            if (query?.customerId && row.customerId !== query.customerId) return false;
            if (query?.bundleId && row.bundleId !== query.bundleId) return false;
            return true;
          }),
        ),
      ),
    expireHeldBooking: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        booking.status = "EXPIRED";
        restoreCredit(bundleState, booking.id, "Payment hold expired");
        return clone(decorateBooking(booking));
      }),
    promoteWaitlistedBooking: (bookingId) =>
      applyMockEffects(() => {
        const booking = findBooking(bookingId);
        if (!booking) throw new Error("Booking not found");
        return clone(promoteWaitlisted(booking));
      }),
  });
}

export const mockAdapter = createMemoryAdapter();

export function getMockAdapter(): MockDataAdapter {
  return mockAdapter;
}

export { toPublicCoach };
