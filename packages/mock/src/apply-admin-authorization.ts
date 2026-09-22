import type { AdminPaymentTab, PermissionKey } from "@balanse/domain";
import { canGrantPermissions, hasPermission, isSuperAdminRoleKey } from "@balanse/domain";
import type { AdminPaymentQueueQuery, MockDataAdapter } from "./adapter";
import {
  assertLastSuperAdminDisable,
  MockAuthorizationError,
  redactReports,
  requireAnyPermission,
  requirePermission,
  requireScopedPermission,
  requireStaffActor,
  scopeDashboardSnapshot,
  sessionAssignedToActor,
  stripCoachRates,
  stripRosterBooking,
  stripSessionRates,
} from "./authorize";
import { MOCK_STAFF_IDS, resolveMockStaffActorFromStaffId } from "./staff-fixtures";

function bookingSessionId(adapter: MockDataAdapter, bookingId: string): Promise<string | null> {
  return adapter.getBooking(bookingId).then((booking) => booking?.sessionId ?? null);
}

async function requireSessionScope(
  inner: MockDataAdapter,
  sessionId: string,
  ownKey: PermissionKey,
  allKey: PermissionKey,
) {
  const actor = requireStaffActor();
  const sessions = await inner.getAdminSessions();
  const session = sessions.find((row) => row.id === sessionId);
  return requireScopedPermission(ownKey, allKey, sessionAssignedToActor(session, actor));
}

function filterRefundRows<T extends { refundStatus?: string }>(
  rows: T[],
  canReadRefunds: boolean,
): T[] {
  if (canReadRefunds) return rows;
  return rows.filter(
    (row) => row.refundStatus !== "REFUND_PENDING" && row.refundStatus !== "REFUNDED",
  );
}

export function applyAdminAuthorization(inner: MockDataAdapter): MockDataAdapter {
  const authorized: MockDataAdapter = {
    ...inner,

    getAdminBookings: (filters) => {
      requirePermission("bookings.read");
      return inner.getAdminBookings(filters);
    },
    confirmAdminBooking: (id) => {
      requirePermission("bookings.confirm");
      return inner.confirmAdminBooking(id);
    },
    rejectAdminBooking: (id, reason) => {
      requirePermission("bookings.reject");
      return inner.rejectAdminBooking(id, reason);
    },
    getAdminPayments: ((query?: AdminPaymentQueueQuery) => {
      const tab: AdminPaymentTab = query?.tab ?? "gcash";
      if (tab === "refunds") requirePermission("refunds.read");
      else requirePermission("payments.read");
      const actor = requireStaffActor();
      const resultPromise =
        query === undefined ? inner.getAdminPayments() : inner.getAdminPayments(query);
      return Promise.resolve(resultPromise).then((result) => {
        if (Array.isArray(result)) {
          return filterRefundRows(result, hasPermission(actor, "refunds.read"));
        }
        if (tab === "refunds" || hasPermission(actor, "refunds.read")) return result;
        return { ...result, items: filterRefundRows(result.items, false) };
      });
    }) as MockDataAdapter["getAdminPayments"],
    recordCash: (bookingId) => {
      requirePermission("payments.record_cash");
      return inner.recordCash(bookingId);
    },
    markRefundPending: (bookingId) => {
      requirePermission("refunds.manage");
      return inner.markRefundPending(bookingId);
    },
    markRefunded: (bookingId) => {
      requirePermission("refunds.manage");
      return inner.markRefunded(bookingId);
    },
    getAdminPaymentProofSignedUrl: (bookingId) => {
      requirePermission("payments.review");
      return inner.getAdminPaymentProofSignedUrl(bookingId);
    },
    getAdminClasses: () => {
      requireAnyPermission(["classes.read", "classes.manage"]);
      return inner.getAdminClasses();
    },
    upsertAdminClass: (input) => {
      requirePermission("classes.manage");
      return inner.upsertAdminClass(input);
    },
    getAdminCoaches: async () => {
      requireAnyPermission(["coaches.read", "coaches.manage"]);
      const actor = requireStaffActor();
      const rows = await inner.getAdminCoaches();
      if (hasPermission(actor, "coach_rates.read")) return rows;
      return rows.map((row) => stripCoachRates(row));
    },
    upsertAdminCoach: async (input) => {
      requirePermission("coaches.manage");
      const actor = requireStaffActor();
      if (hasPermission(actor, "coach_rates.manage")) {
        return inner.upsertAdminCoach(input);
      }
      const existing = input.id
        ? (await inner.getAdminCoaches()).find((row) => row.id === input.id)
        : undefined;
      return inner.upsertAdminCoach({
        ...input,
        defaultRatePhp: existing?.defaultRatePhp ?? 0,
        rateType: existing?.rateType ?? input.rateType,
      });
    },
    getAdminSessions: async () => {
      const actor = requireAnyPermission(["schedule.read.all", "schedule.read.own"]);
      const rows = await inner.getAdminSessions();
      const scoped = hasPermission(actor, "schedule.read.all")
        ? rows
        : rows.filter((row) => sessionAssignedToActor(row, actor));
      if (hasPermission(actor, "coach_rates.read")) return scoped;
      return scoped.map((row) => stripSessionRates(row));
    },
    upsertAdminSession: (input) => {
      requirePermission(input.id ? "schedule.update" : "schedule.create");
      return inner.upsertAdminSession(input);
    },
    duplicateAdminSchedule: (input) => {
      requirePermission("schedule.recurrence.manage");
      return inner.duplicateAdminSchedule(input);
    },
    createAdminRecurringSchedule: (input) => {
      requirePermission("schedule.recurrence.manage");
      return inner.createAdminRecurringSchedule(input);
    },
    cancelAdminSession: (id) => {
      requirePermission("schedule.cancel");
      return inner.cancelAdminSession(id);
    },
    getAdminCancellationRequests: ((query) => {
      requirePermission("cancellations.read");
      return inner.getAdminCancellationRequests(query as never);
    }) as MockDataAdapter["getAdminCancellationRequests"],
    completeAdminCancellation: (bookingId) => {
      requirePermission("cancellations.manage");
      return inner.completeAdminCancellation(bookingId);
    },
    rejectAdminCancellation: (bookingId, reason) => {
      requirePermission("cancellations.manage");
      return inner.rejectAdminCancellation(bookingId, reason);
    },
    getAdminRescheduleRequests: ((query) => {
      requirePermission("reschedules.read");
      return inner.getAdminRescheduleRequests(query as never);
    }) as MockDataAdapter["getAdminRescheduleRequests"],
    approveAdminReschedule: (bookingId) => {
      requirePermission("reschedules.manage");
      return inner.approveAdminReschedule(bookingId);
    },
    rejectAdminReschedule: (bookingId, reason) => {
      requirePermission("reschedules.manage");
      return inner.rejectAdminReschedule(bookingId, reason);
    },
    getAdminSessionRoster: async (sessionId) => {
      await requireSessionScope(inner, sessionId, "roster.read.own", "roster.read.all");
      const actor = requireStaffActor();
      const roster = await inner.getAdminSessionRoster(sessionId);
      const includePayment = hasPermission(actor, "payments.read");
      const session = hasPermission(actor, "coach_rates.read")
        ? roster.session
        : stripSessionRates(roster.session);
      return {
        ...roster,
        session,
        confirmed: roster.confirmed.map((row) => stripRosterBooking(row, includePayment)),
        held: roster.held.map((row) => stripRosterBooking(row, includePayment)),
        waitlisted: roster.waitlisted.map((row) => stripRosterBooking(row, includePayment)),
      };
    },
    checkIn: async (bookingId) => {
      const sessionId = await bookingSessionId(inner, bookingId);
      if (!sessionId) throw new Error("Booking not found");
      await requireSessionScope(inner, sessionId, "attendance.manage.own", "attendance.manage.all");
      return inner.checkIn(bookingId);
    },
    markNoShow: async (bookingId) => {
      const sessionId = await bookingSessionId(inner, bookingId);
      if (!sessionId) throw new Error("Booking not found");
      await requireSessionScope(inner, sessionId, "attendance.manage.own", "attendance.manage.all");
      return inner.markNoShow(bookingId);
    },
    getAdminReportsSales: () => {
      requirePermission("reports.sales.read");
      return inner.getAdminReportsSales();
    },
    getAdminReports: async (filters) => {
      const actor = requireAnyPermission([
        "reports.sales.read",
        "reports.capacity.read",
        "reports.coach_costs.read",
        "reports.session.read",
      ]);
      return redactReports(await inner.getAdminReports(filters), actor);
    },
    getAdminSessionReport: async (sessionId) => {
      requirePermission("reports.session.read");
      const report = await inner.getAdminSessionReport(sessionId);
      const actor = requireStaffActor();
      if (!report || hasPermission(actor, "reports.coach_costs.read")) return report;
      return {
        ...report,
        coachCostPhp: 0,
        grossContributionPhp: report.grossRevenuePhp - report.refundsPhp,
      };
    },
    getAdminStaff: () => {
      requireAnyPermission(["staff.read", "staff.manage"]);
      return inner.getAdminStaff();
    },
    upsertAdminStaff: (input) => {
      requirePermission("staff.manage");
      return inner.upsertAdminStaff(input);
    },
    getAdminStaffRoles: () => {
      requireAnyPermission(["roles.read", "roles.manage"]);
      return inner.getAdminStaffRoles();
    },
    getAdminStaffRole: (id) => {
      requireAnyPermission(["roles.read", "roles.manage"]);
      return inner.getAdminStaffRole(id);
    },
    upsertAdminStaffRole: (input) => {
      const actor = requirePermission("roles.manage");
      if (!canGrantPermissions(actor, input.permissionKeys)) {
        throw new MockAuthorizationError(
          "forbidden",
          "You can only grant permissions your own role already has.",
        );
      }
      return inner.upsertAdminStaffRole(input);
    },
    archiveAdminStaffRole: (id) => {
      requirePermission("roles.manage");
      return inner.archiveAdminStaffRole(id);
    },
    disableAdminStaff: async (id) => {
      requirePermission("staff.manage");
      const rows = await inner.getAdminStaff();
      const target = rows.find((row) => row.id === id);
      const targetActor = resolveMockStaffActorFromStaffId(id);
      const activeSuperAdmins = rows
        .filter((row) => row.status === "active")
        .filter((row) => {
          const actor = resolveMockStaffActorFromStaffId(row.id);
          return actor ? isSuperAdminRoleKey(actor.roleKey) : row.id === MOCK_STAFF_IDS.rex;
        })
        .map((row) => row.id);
      if (target) {
        assertLastSuperAdminDisable({
          targetStaffId: id,
          targetRoleKey:
            targetActor?.roleKey ?? (target.id === MOCK_STAFF_IDS.rex ? "super_admin" : ""),
          activeSuperAdminStaffIds: activeSuperAdmins,
        });
      }
      return inner.disableAdminStaff(id);
    },
    getAdminCustomers: (filters) => {
      requirePermission("customers.read");
      return inner.getAdminCustomers(filters);
    },
    getAdminCustomer: (id) => {
      requirePermission("customers.read");
      return inner.getAdminCustomer(id);
    },
    getAdminSettings: () => {
      requireAnyPermission([
        "settings.content.manage",
        "settings.policies.manage",
        "settings.payment_qr.manage",
      ]);
      return inner.getAdminSettings();
    },
    upsertPolicyDocument: (input) => {
      requirePermission("settings.policies.manage");
      return inner.upsertPolicyDocument(input);
    },
    deletePolicyDocument: (id) => {
      requirePermission("settings.policies.manage");
      return inner.deletePolicyDocument(id);
    },
    updateAdminSettings: (patch) => {
      requireAnyPermission(["settings.content.manage", "settings.policies.manage"]);
      return inner.updateAdminSettings(patch);
    },
    listPaymentQrs: (includeArchived) => {
      requirePermission("settings.payment_qr.manage");
      return inner.listPaymentQrs(includeArchived);
    },
    upsertPaymentQr: (input) => {
      requirePermission("settings.payment_qr.manage");
      return inner.upsertPaymentQr(input);
    },
    activatePaymentQr: (id) => {
      requirePermission("settings.payment_qr.manage");
      return inner.activatePaymentQr(id);
    },
    archivePaymentQr: (id) => {
      requirePermission("settings.payment_qr.manage");
      return inner.archivePaymentQr(id);
    },
    promotePolicyVersion: (documentName, version) => {
      requirePermission("settings.policies.manage");
      return inner.promotePolicyVersion(documentName, version);
    },
    getAdminDashboard: async () => {
      const actor = requireAnyPermission(["dashboard.operations.read", "dashboard.financial.read"]);
      const [snap, bookings] = await Promise.all([
        inner.getAdminDashboard(),
        inner.getAdminBookings(),
      ]);
      return scopeDashboardSnapshot(snap, actor, bookings);
    },
    getAdminBundles: () => {
      requireAnyPermission(["bundles.read", "bundles.manage"]);
      return inner.getAdminBundles();
    },
    getAdminBundle: (id) => {
      requireAnyPermission(["bundles.read", "bundles.manage"]);
      return inner.getAdminBundle(id);
    },
    upsertAdminBundle: (input) => {
      requirePermission("bundles.manage");
      return inner.upsertAdminBundle(input);
    },
    setAdminBundleStatus: (id, status) => {
      requirePermission("bundles.manage");
      return inner.setAdminBundleStatus(id, status);
    },
    grantCustomerBundle: (input) => {
      requirePermission("bundles.manage");
      const actor = requireStaffActor();
      return inner.grantCustomerBundle({ ...input, actorId: input.actorId ?? actor.staffId });
    },
    revokeCustomerEntitlement: (input) => {
      requirePermission("bundles.manage");
      const actor = requireStaffActor();
      return inner.revokeCustomerEntitlement({ ...input, actorId: input.actorId ?? actor.staffId });
    },
    getAdminBundleAcquisitions: (status) => {
      requireAnyPermission(["bundles.read", "bundles.manage"]);
      return inner.getAdminBundleAcquisitions(status);
    },
    approveBundleAcquisition: (id, actorId) => {
      requirePermission("bundles.manage");
      const actor = requireStaffActor();
      return inner.approveBundleAcquisition(id, actorId ?? actor.staffId);
    },
    rejectBundleAcquisition: (id, reason, actorId) => {
      requirePermission("bundles.manage");
      const actor = requireStaffActor();
      return inner.rejectBundleAcquisition(id, reason, actorId ?? actor.staffId);
    },
    getAdminCustomerEntitlements: (customerId) => {
      requireAnyPermission(["bundles.read", "bundles.manage"]);
      return inner.getAdminCustomerEntitlements(customerId);
    },
    getBundleAudit: (query) => {
      requireAnyPermission(["bundles.read", "bundles.manage"]);
      return inner.getBundleAudit(query);
    },
  };

  return authorized;
}
