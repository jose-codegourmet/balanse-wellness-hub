import type {
  AdminCoach,
  AdminDashboardSnapshot,
  AdminReports,
  AdminSession,
  CustomerBooking,
  PermissionKey,
  StaffAuthorizationActor,
} from "@balanse/domain";
import {
  hasPermission,
  hasScopedPermission,
  isInteractiveStaffActor,
  occupancyForSessions,
  violatesLastSuperAdminInvariant,
} from "@balanse/domain";
import { getBoundMockPrincipal, getBoundMockStaffActor } from "./session";

export type MockAuthDenial =
  | "guest"
  | "customer"
  | "disabled_staff"
  | "inactive_role"
  | "forbidden"
  | "ownership"
  | "last_super_admin";

export class MockAuthorizationError extends Error {
  readonly code: MockAuthDenial;
  readonly permission?: PermissionKey;

  constructor(code: MockAuthDenial, message: string, permission?: PermissionKey) {
    super(message);
    this.name = "MockAuthorizationError";
    this.code = code;
    this.permission = permission;
  }
}

export function isMockAuthorizationError(error: unknown): error is MockAuthorizationError {
  return error instanceof MockAuthorizationError;
}

function denyBoundPrincipal(): never {
  const principal = getBoundMockPrincipal();
  if (principal.role === "guest") {
    throw new MockAuthorizationError("guest", "Guest principals cannot access admin data.");
  }
  if (principal.role === "customer") {
    throw new MockAuthorizationError("customer", "Customer principals cannot access admin data.");
  }
  const actor = getBoundMockStaffActor();
  if (!actor) {
    throw new MockAuthorizationError("forbidden", "Staff principal could not be resolved.");
  }
  if (actor.staffStatus === "disabled") {
    throw new MockAuthorizationError("disabled_staff", "Disabled staff cannot access admin data.");
  }
  if (!actor.roleActive) {
    throw new MockAuthorizationError("inactive_role", "This staff role is not active.");
  }
  throw new MockAuthorizationError("forbidden", "This staff principal is not authorized.");
}

export function requireStaffActor(): StaffAuthorizationActor {
  const actor = getBoundMockStaffActor();
  if (!isInteractiveStaffActor(actor) || !actor) denyBoundPrincipal();
  return actor;
}

export function requirePermission(key: PermissionKey): StaffAuthorizationActor {
  const actor = requireStaffActor();
  if (!hasPermission(actor, key)) {
    throw new MockAuthorizationError("forbidden", `Missing permission: ${key}.`, key);
  }
  return actor;
}

export function requireAnyPermission(keys: readonly PermissionKey[]): StaffAuthorizationActor {
  const actor = requireStaffActor();
  if (!keys.some((key) => hasPermission(actor, key))) {
    throw new MockAuthorizationError(
      "forbidden",
      `Missing permission: ${keys.join(" | ")}.`,
      keys[0],
    );
  }
  return actor;
}

export function requireScopedPermission(
  ownKey: PermissionKey,
  allKey: PermissionKey,
  ownsResource: boolean,
): StaffAuthorizationActor {
  const actor = requireStaffActor();
  if (!hasScopedPermission(actor, ownKey, allKey, ownsResource)) {
    if (hasPermission(actor, ownKey) && !ownsResource) {
      throw new MockAuthorizationError(
        "ownership",
        "This record is outside the signed-in coach's assignments.",
        ownKey,
      );
    }
    throw new MockAuthorizationError("forbidden", `Missing permission: ${ownKey} | ${allKey}.`);
  }
  return actor;
}

export function sessionAssignedToActor(
  session: Pick<AdminSession, "coaches" | "coachAssignments"> | null | undefined,
  actor: StaffAuthorizationActor | null | undefined,
): boolean {
  if (!session || !actor?.coachId) return false;
  if (session.coaches.some((coach) => coach.id === actor.coachId)) return true;
  return session.coachAssignments.some((row) => row.coachId === actor.coachId);
}

export function assertLastSuperAdminDisable(input: {
  targetStaffId: string;
  targetRoleKey: string;
  activeSuperAdminStaffIds: readonly string[];
}): void {
  const remaining = input.activeSuperAdminStaffIds.filter(
    (id) => id !== input.targetStaffId,
  ).length;
  const targetHoldsSuperAdmin = input.targetRoleKey === "super_admin";
  const includingTarget = remaining + (targetHoldsSuperAdmin ? 1 : 0);
  if (
    violatesLastSuperAdminInvariant({
      targetHoldsSuperAdmin,
      remainingActiveSuperAdminCount: includingTarget,
      action: "disable",
    })
  ) {
    throw new MockAuthorizationError(
      "last_super_admin",
      "The last active Super Admin cannot be disabled.",
    );
  }
}

export function stripCoachRates<T extends AdminCoach>(coach: T): T {
  return { ...coach, defaultRatePhp: 0, rateType: coach.rateType };
}

export function stripSessionRates(session: AdminSession): AdminSession {
  return {
    ...session,
    coachRatePhp: 0,
    coachAssignments: session.coachAssignments.map((row) => ({
      ...row,
      coachRatePhp: 0,
    })),
  };
}

export function redactDashboardFinancials(
  snapshot: AdminDashboardSnapshot,
): AdminDashboardSnapshot {
  return {
    ...snapshot,
    todaysSalesPhp: 0,
    pendingRefundsPhp: 0,
    coachCostTodayPhp: 0,
    series: snapshot.series ? { ...snapshot.series, gross_sales: undefined } : snapshot.series,
  };
}

export function scopeDashboardSnapshot(
  snapshot: AdminDashboardSnapshot,
  actor: StaffAuthorizationActor,
  bookings: CustomerBooking[],
): AdminDashboardSnapshot {
  const schedule = hasPermission(actor, "schedule.read.all")
    ? snapshot.todaysSchedule
    : snapshot.todaysSchedule.filter((row) => sessionAssignedToActor(row, actor));
  const scoped = {
    ...snapshot,
    todaysSchedule: hasPermission(actor, "coach_rates.read")
      ? schedule
      : schedule.map((row) => stripSessionRates(row)),
    todaysClasses: schedule.length,
    todaysOccupancy: occupancyForSessions(schedule, bookings),
    pendingPayments: hasPermission(actor, "payments.read") ? snapshot.pendingPayments : 0,
    cancellations: hasPermission(actor, "cancellations.read") ? snapshot.cancellations : 0,
    reschedules: hasPermission(actor, "reschedules.read") ? snapshot.reschedules : 0,
    waitlisted: hasPermission(actor, "bookings.read") ? snapshot.waitlisted : 0,
    attention: {
      payments: hasPermission(actor, "payments.read") ? snapshot.attention.payments : 0,
      cancellations: hasPermission(actor, "cancellations.read")
        ? snapshot.attention.cancellations
        : 0,
      reschedules: hasPermission(actor, "reschedules.read") ? snapshot.attention.reschedules : 0,
    },
  };
  return hasPermission(actor, "dashboard.financial.read")
    ? scoped
    : redactDashboardFinancials(scoped);
}

/** Attendance roster rows: name + status. No directory, refund, or proof fields. */
export function stripRosterBooking(row: CustomerBooking, includePayment: boolean): CustomerBooking {
  return {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    sessionId: row.sessionId,
    status: row.status,
    paymentMethod: includePayment ? row.paymentMethod : null,
    paymentStatus: includePayment ? row.paymentStatus : "NONE",
    refundStatus: "NOT_APPLICABLE",
    holdExpiresAt: null,
    createdAt: row.createdAt,
    session: row.session,
  };
}

export function redactReports(reports: AdminReports, actor: StaffAuthorizationActor): AdminReports {
  const includeSales = hasPermission(actor, "reports.sales.read");
  const includeCost = hasPermission(actor, "reports.coach_costs.read");
  return {
    overview: includeSales
      ? reports.overview
      : {
          ...reports.overview,
          grossSalesPhp: 0,
          refundsPhp: 0,
          netSalesPhp: 0,
        },
    classPerformance:
      includeSales || hasPermission(actor, "reports.capacity.read")
        ? reports.classPerformance.map((row) => ({
            ...row,
            revenuePhp: includeSales ? row.revenuePhp : 0,
          }))
        : [],
    coachCosts: includeCost ? reports.coachCosts : [],
    sessionPerformance: hasPermission(actor, "reports.session.read")
      ? reports.sessionPerformance.map((row) => ({
          ...row,
          revenuePhp: includeSales ? row.revenuePhp : 0,
          coachCostPhp: includeCost ? row.coachCostPhp : 0,
        }))
      : [],
  };
}
