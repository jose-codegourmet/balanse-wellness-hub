import type { AdminDashboardSnapshot } from "@balanse/domain";
import type { AdminSidebarNavProps } from "./AdminSidebarNav.schema";

export const sidebarSnapshotWithCounts: AdminDashboardSnapshot = {
  todaysClasses: 4,
  pendingPayments: 3,
  cancellations: 2,
  reschedules: 1,
  waitlisted: 5,
  attention: { payments: 3, cancellations: 2, reschedules: 1 },
  todaysSchedule: [],
  todaysSalesPhp: 0,
  pendingRefundsPhp: 0,
  todaysOccupancy: 0,
  coachCostTodayPhp: 0,
};

export const sidebarSnapshotEmpty: AdminDashboardSnapshot = {
  ...sidebarSnapshotWithCounts,
  pendingPayments: 0,
  cancellations: 0,
  reschedules: 0,
  waitlisted: 0,
  attention: { payments: 0, cancellations: 0, reschedules: 0 },
};

export const sidebarSnapshotOverflow: AdminDashboardSnapshot = {
  ...sidebarSnapshotWithCounts,
  pendingPayments: 142,
};

export const adminSidebarNavDefaultValues: Partial<AdminSidebarNavProps> = {
  pathname: "/dashboard",
  collapsed: false,
  snapshot: sidebarSnapshotWithCounts,
};
