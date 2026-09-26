import type { AdminPaymentTab, AdminReportFilters } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { MockPrincipal } from "@balanse/mock/session";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { adminAuthScope, bindAdminQueryPrincipal } from "./auth-scope";
import { type AdminBookingListFilters, type AdminCustomerListFilters, adminKeys } from "./keys";

function withPrincipal<T>(principal: MockPrincipal, work: () => Promise<T>): Promise<T> {
  bindAdminQueryPrincipal(principal);
  return work();
}

export const adminDashboardQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.dashboard(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminDashboard()),
  });
};

export const adminBookingsQuery = (principal: MockPrincipal, filters?: AdminBookingListFilters) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.bookings.list(scope, filters),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminBookings(filters)),
  });
};

export const adminBookingDetailQuery = (principal: MockPrincipal, id: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.bookings.detail(scope, id),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getBooking(id)),
  });
};

export const adminPaymentsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.payments.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminPayments()),
  });
};

export const adminPaymentProofUrlQuery = (principal: MockPrincipal, bookingId: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.proofUrl(scope, bookingId),
    queryFn: () =>
      withPrincipal(principal, () => getMockAdapter().getAdminPaymentProofSignedUrl(bookingId)),
  });
};

export const adminClassesQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.classes.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminClasses()),
  });
};

export const adminCoachesQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.coaches.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminCoaches()),
  });
};

export const adminSessionsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.sessions.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminSessions()),
  });
};

export const adminEventsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.events.list(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminEvents()),
  });
};

export const adminEventDetailQuery = (principal: MockPrincipal, id: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.events.detail(scope, id),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminEvent(id)),
  });
};

export const adminEventForSessionQuery = (principal: MockPrincipal, sessionId: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.events.forSession(scope, sessionId),
    queryFn: () =>
      withPrincipal(principal, () => getMockAdapter().getAdminEventForSession(sessionId)),
  });
};

export const adminCancellationsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.cancellations.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminCancellationRequests()),
  });
};

export const adminReschedulesQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.reschedules.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminRescheduleRequests()),
  });
};

export const adminSessionRosterQuery = (principal: MockPrincipal, sessionId: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.roster(scope, sessionId),
    queryFn: () =>
      withPrincipal(principal, () => getMockAdapter().getAdminSessionRoster(sessionId)),
  });
};

export const adminStaffQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.staff.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminStaff()),
  });
};

export const adminStaffRolesQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.staff.roles.list(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminStaffRoles()),
  });
};

export const adminStaffRoleQuery = (principal: MockPrincipal, roleId: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.staff.roles.detail(scope, roleId),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminStaffRole(roleId)),
  });
};

export const adminCustomersQuery = (
  principal: MockPrincipal,
  filters?: AdminCustomerListFilters,
) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.customers.list(scope, filters),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminCustomers(filters)),
  });
};

export const adminBundlesQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.bundles.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminBundles()),
  });
};

export const adminBundleAcquisitionsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.bundles.acquisitions(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminBundleAcquisitions()),
  });
};

export const adminCustomerDetailQuery = (principal: MockPrincipal, id: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.customers.detail(scope, id),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminCustomer(id)),
  });
};

export const adminSettingsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.settings.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminSettings()),
  });
};

export const adminPaymentQrsQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.paymentQrs.all(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().listPaymentQrs()),
  });
};

export const adminReportsQuery = (principal: MockPrincipal, filters: AdminReportFilters) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.reports.list(scope, filters),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminReports(filters)),
  });
};

export const adminReportsSalesQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.reports.sales(scope),
    queryFn: () => withPrincipal(principal, () => getMockAdapter().getAdminReportsSales()),
  });
};

export const adminSessionReportQuery = (principal: MockPrincipal, sessionId: string) => {
  const scope = adminAuthScope(principal);
  return queryOptions({
    queryKey: adminKeys.reports.session(scope, sessionId),
    queryFn: () =>
      withPrincipal(principal, () => getMockAdapter().getAdminSessionReport(sessionId)),
  });
};

export const adminPaymentsQueueInfiniteQuery = (principal: MockPrincipal, tab: AdminPaymentTab) => {
  const scope = adminAuthScope(principal);
  return infiniteQueryOptions({
    queryKey: adminKeys.queues.payments(scope, tab),
    queryFn: ({ pageParam }) =>
      withPrincipal(principal, () => getMockAdapter().getAdminPayments({ tab, cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};

export const adminCancellationsInfiniteQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return infiniteQueryOptions({
    queryKey: adminKeys.queues.cancellations(scope),
    queryFn: ({ pageParam }) =>
      withPrincipal(principal, () =>
        getMockAdapter().getAdminCancellationRequests({ cursor: pageParam }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};

export const adminReschedulesInfiniteQuery = (principal: MockPrincipal) => {
  const scope = adminAuthScope(principal);
  return infiniteQueryOptions({
    queryKey: adminKeys.queues.reschedules(scope),
    queryFn: ({ pageParam }) =>
      withPrincipal(principal, () =>
        getMockAdapter().getAdminRescheduleRequests({ cursor: pageParam }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
};
