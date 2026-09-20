import type { AdminReportFilters, BookingStatus } from "@balanse/domain";
import type { MockRole } from "@balanse/mock/session";

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
  all: (role: MockRole) => ["admin", role] as const,

  dashboard: (role: MockRole) => [...adminKeys.all(role), "dashboard"] as const,

  bookings: {
    all: (role: MockRole) => [...adminKeys.all(role), "bookings"] as const,
    list: (role: MockRole, filters?: AdminBookingListFilters) =>
      [...adminKeys.bookings.all(role), "list", filters ?? null] as const,
    detail: (role: MockRole, id: string) =>
      [...adminKeys.bookings.all(role), "detail", id] as const,
  },

  payments: { all: (role: MockRole) => [...adminKeys.all(role), "payments"] as const },
  cancellations: { all: (role: MockRole) => [...adminKeys.all(role), "cancellations"] as const },
  reschedules: { all: (role: MockRole) => [...adminKeys.all(role), "reschedules"] as const },
  classes: { all: (role: MockRole) => [...adminKeys.all(role), "classes"] as const },
  coaches: { all: (role: MockRole) => [...adminKeys.all(role), "coaches"] as const },
  sessions: { all: (role: MockRole) => [...adminKeys.all(role), "sessions"] as const },
  staff: { all: (role: MockRole) => [...adminKeys.all(role), "staff"] as const },
  settings: { all: (role: MockRole) => [...adminKeys.all(role), "settings"] as const },

  customers: {
    all: (role: MockRole) => [...adminKeys.all(role), "customers"] as const,
    list: (role: MockRole, filters?: AdminCustomerListFilters) =>
      [...adminKeys.customers.all(role), "list", filters ?? null] as const,
    detail: (role: MockRole, id: string) =>
      [...adminKeys.customers.all(role), "detail", id] as const,
  },

  rosterAll: (role: MockRole) => [...adminKeys.all(role), "roster"] as const,
  roster: (role: MockRole, sessionId: string) => [...adminKeys.rosterAll(role), sessionId] as const,
  proofUrl: (role: MockRole, bookingId: string) =>
    [...adminKeys.all(role), "proof-url", bookingId] as const,

  reports: {
    all: (role: MockRole) => [...adminKeys.all(role), "reports"] as const,
    list: (role: MockRole, filters: AdminReportFilters) =>
      [...adminKeys.reports.all(role), "list", filters] as const,
    sales: (role: MockRole) => [...adminKeys.reports.all(role), "sales"] as const,
    session: (role: MockRole, sessionId: string) =>
      [...adminKeys.reports.all(role), "session", sessionId] as const,
  },

  /** Landing spot for FE-ADM-020 (#210) infinite queue keys. Do not reshape. */
  queues: {
    all: (role: MockRole) => [...adminKeys.all(role), "queues"] as const,
  },
} as const;
