import type { AdminPaymentTab, AdminReportFilters, BookingStatus } from "@balanse/domain";
import type { AdminAuthScope } from "./auth-scope";

export type AdminBookingListFilters = {
  status?: BookingStatus;
  query?: string;
  classId?: string;
  date?: string;
};

export type AdminCustomerListFilters = {
  query?: string;
  hasUpcoming?: boolean;
};

export const adminKeys = {
  all: (scope: AdminAuthScope) => ["admin", scope] as const,

  dashboard: (scope: AdminAuthScope) => [...adminKeys.all(scope), "dashboard"] as const,

  bookings: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "bookings"] as const,
    list: (scope: AdminAuthScope, filters?: AdminBookingListFilters) =>
      [...adminKeys.bookings.all(scope), "list", filters ?? null] as const,
    detail: (scope: AdminAuthScope, id: string) =>
      [...adminKeys.bookings.all(scope), "detail", id] as const,
  },

  payments: { all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "payments"] as const },
  cancellations: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "cancellations"] as const,
  },
  reschedules: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "reschedules"] as const,
  },
  classes: { all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "classes"] as const },
  bundles: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "bundles"] as const,
    acquisitions: (scope: AdminAuthScope) =>
      [...adminKeys.bundles.all(scope), "acquisitions"] as const,
  },
  coaches: { all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "coaches"] as const },
  sessions: { all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "sessions"] as const },
  events: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "events"] as const,
    list: (scope: AdminAuthScope) => [...adminKeys.events.all(scope), "list"] as const,
    detail: (scope: AdminAuthScope, id: string) =>
      [...adminKeys.events.all(scope), "detail", id] as const,
    forSession: (scope: AdminAuthScope, sessionId: string) =>
      [...adminKeys.events.all(scope), "session", sessionId] as const,
  },
  staff: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "staff"] as const,
    roles: {
      all: (scope: AdminAuthScope) => [...adminKeys.staff.all(scope), "roles"] as const,
      list: (scope: AdminAuthScope) => [...adminKeys.staff.roles.all(scope), "list"] as const,
      detail: (scope: AdminAuthScope, id: string) =>
        [...adminKeys.staff.roles.all(scope), "detail", id] as const,
    },
  },
  settings: { all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "settings"] as const },
  paymentQrs: { all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "payment-qrs"] as const },

  customers: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "customers"] as const,
    list: (scope: AdminAuthScope, filters?: AdminCustomerListFilters) =>
      [...adminKeys.customers.all(scope), "list", filters ?? null] as const,
    detail: (scope: AdminAuthScope, id: string) =>
      [...adminKeys.customers.all(scope), "detail", id] as const,
  },

  rosterAll: (scope: AdminAuthScope) => [...adminKeys.all(scope), "roster"] as const,
  roster: (scope: AdminAuthScope, sessionId: string) =>
    [...adminKeys.rosterAll(scope), sessionId] as const,
  proofUrl: (scope: AdminAuthScope, bookingId: string) =>
    [...adminKeys.all(scope), "proof-url", bookingId] as const,

  reports: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "reports"] as const,
    list: (scope: AdminAuthScope, filters: AdminReportFilters) =>
      [...adminKeys.reports.all(scope), "list", filters] as const,
    sales: (scope: AdminAuthScope) => [...adminKeys.reports.all(scope), "sales"] as const,
    session: (scope: AdminAuthScope, sessionId: string) =>
      [...adminKeys.reports.all(scope), "session", sessionId] as const,
  },

  /** Infinite queue keys for FE-ADM-020 (#210). Prefix stays `queues`. */
  queues: {
    all: (scope: AdminAuthScope) => [...adminKeys.all(scope), "queues"] as const,
    payments: (scope: AdminAuthScope, tab: AdminPaymentTab) =>
      [...adminKeys.queues.all(scope), "payments", tab] as const,
    cancellations: (scope: AdminAuthScope) =>
      [...adminKeys.queues.all(scope), "cancellations"] as const,
    reschedules: (scope: AdminAuthScope) =>
      [...adminKeys.queues.all(scope), "reschedules"] as const,
  },
} as const;
