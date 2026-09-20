import type { AdminReportFilters } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { MockRole } from "@balanse/mock/session";
import { queryOptions } from "@tanstack/react-query";
import { type AdminBookingListFilters, type AdminCustomerListFilters, adminKeys } from "./keys";

export const adminDashboardQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.dashboard(role),
    queryFn: () => getMockAdapter().getAdminDashboard(),
  });

export const adminBookingsQuery = (role: MockRole, filters?: AdminBookingListFilters) =>
  queryOptions({
    queryKey: adminKeys.bookings.list(role, filters),
    queryFn: () => getMockAdapter().getAdminBookings(filters),
  });

export const adminBookingDetailQuery = (role: MockRole, id: string) =>
  queryOptions({
    queryKey: adminKeys.bookings.detail(role, id),
    queryFn: () => getMockAdapter().getBooking(id),
  });

export const adminPaymentsQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.payments.all(role),
    queryFn: () => getMockAdapter().getAdminPayments(),
  });

export const adminPaymentProofUrlQuery = (role: MockRole, bookingId: string) =>
  queryOptions({
    queryKey: adminKeys.proofUrl(role, bookingId),
    queryFn: () => getMockAdapter().getAdminPaymentProofSignedUrl(bookingId),
  });

export const adminClassesQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.classes.all(role),
    queryFn: () => getMockAdapter().getAdminClasses(),
  });

export const adminCoachesQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.coaches.all(role),
    queryFn: () => getMockAdapter().getAdminCoaches(),
  });

export const adminSessionsQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.sessions.all(role),
    queryFn: () => getMockAdapter().getAdminSessions(),
  });

export const adminCancellationsQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.cancellations.all(role),
    queryFn: () => getMockAdapter().getAdminCancellationRequests(),
  });

export const adminReschedulesQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.reschedules.all(role),
    queryFn: () => getMockAdapter().getAdminRescheduleRequests(),
  });

export const adminSessionRosterQuery = (role: MockRole, sessionId: string) =>
  queryOptions({
    queryKey: adminKeys.roster(role, sessionId),
    queryFn: () => getMockAdapter().getAdminSessionRoster(sessionId),
  });

export const adminStaffQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.staff.all(role),
    queryFn: () => getMockAdapter().getAdminStaff(),
  });

export const adminCustomersQuery = (role: MockRole, filters?: AdminCustomerListFilters) =>
  queryOptions({
    queryKey: adminKeys.customers.list(role, filters),
    queryFn: () => getMockAdapter().getAdminCustomers(filters),
  });

export const adminCustomerDetailQuery = (role: MockRole, id: string) =>
  queryOptions({
    queryKey: adminKeys.customers.detail(role, id),
    queryFn: () => getMockAdapter().getAdminCustomer(id),
  });

export const adminSettingsQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.settings.all(role),
    queryFn: () => getMockAdapter().getAdminSettings(),
  });

export const adminReportsQuery = (role: MockRole, filters: AdminReportFilters) =>
  queryOptions({
    queryKey: adminKeys.reports.list(role, filters),
    queryFn: () => getMockAdapter().getAdminReports(filters),
  });

export const adminReportsSalesQuery = (role: MockRole) =>
  queryOptions({
    queryKey: adminKeys.reports.sales(role),
    queryFn: () => getMockAdapter().getAdminReportsSales(),
  });

export const adminSessionReportQuery = (role: MockRole, sessionId: string) =>
  queryOptions({
    queryKey: adminKeys.reports.session(role, sessionId),
    queryFn: () => getMockAdapter().getAdminSessionReport(sessionId),
  });

// Reserved for FE-ADM-020 (#210) — do not occupy these names:
// adminPaymentsQueueInfiniteQuery
// adminCancellationsInfiniteQuery
// adminReschedulesInfiniteQuery
