import type {
  AdminDashboardSnapshot,
  AdminReportFilters,
  AdminReports,
  AdminSession,
  ClassPerformanceRow,
  CoachCostRow,
  MarketingInsights,
  MetricSeries,
  SalesOverview,
  SessionPerformanceRow,
  SessionReportDrilldown,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";
import { phpToNumber } from "./money";

export type ReportDateRange = { from: string; to: string };

export const getMarketingInsights = (fetcher: ApiFetcher, range: ReportDateRange) => {
  const params = new URLSearchParams({ from: range.from, to: range.to });
  return fetcher<MarketingInsights>(`/api/admin/marketing-insights?${params}`);
};

/** `AdminDashboard`/`/reports/*` read `{from,to}`; `classId`/`coachId`/`sessionStatus` of `"all"` mean "no filter" and must not be sent. */
function reportParams(range: ReportDateRange, filters?: AdminReportFilters): URLSearchParams {
  const params = new URLSearchParams({ from: range.from, to: range.to });
  if (filters?.classId && filters.classId !== "all") params.set("classId", filters.classId);
  if (filters?.coachId && filters.coachId !== "all") params.set("coachId", filters.coachId);
  if (filters?.sessionStatus && filters.sessionStatus !== "all") {
    params.set("sessionStatus", filters.sessionStatus);
  }
  return params;
}

/**
 * The live handler's `todaysSchedule` rows only populate a subset of
 * `AdminSession` (id, className, coachName, coaches, startsAt, endsAt,
 * capacity, customerPrice, status) — enough for the dashboard's preview
 * table, not the full admin session detail. Cast rather than force-fitting
 * every `AdminSession` field (rate snapshots, venue, recurrence) that this
 * endpoint was never meant to compute.
 */
export async function getDashboard(fetcher: ApiFetcher): Promise<AdminDashboardSnapshot> {
  const row = await fetcher<
    Omit<AdminDashboardSnapshot, "todaysSchedule" | "series"> & {
      todaysSchedule: unknown[];
      series?: MetricSeries[];
    }
  >("/api/admin/dashboard");
  return {
    ...row,
    todaysSchedule: row.todaysSchedule as AdminSession[],
    series: row.series
      ? { gross_sales: row.series.find((item) => item.metric === "gross_sales") }
      : undefined,
  };
}

export async function getDashboardMetrics(
  fetcher: ApiFetcher,
): Promise<{ grain: "day"; timezone: string; windowDays: number; series: MetricSeries[] }> {
  return fetcher("/api/admin/dashboard/metrics");
}

export async function getSalesOverview(
  fetcher: ApiFetcher,
  range: ReportDateRange,
  filters?: AdminReportFilters,
): Promise<SalesOverview> {
  const row = await fetcher<{
    "Gross Sales": string;
    Refunds: string;
    "Net Sales": string;
    "Paid Bookings": number;
  }>(`/api/admin/reports/sales-overview?${reportParams(range, filters)}`);
  return {
    grossSalesPhp: phpToNumber(row["Gross Sales"]),
    refundsPhp: phpToNumber(row.Refunds),
    netSalesPhp: phpToNumber(row["Net Sales"]),
    paidBookings: row["Paid Bookings"],
  };
}

export async function getClassPerformance(
  fetcher: ApiFetcher,
  range: ReportDateRange,
  filters?: AdminReportFilters,
): Promise<ClassPerformanceRow[]> {
  const { items } = await fetcher<{
    items: Array<{
      classId: string;
      Class: string;
      Sessions: number;
      Revenue?: string;
      Occupancy?: number;
      "No-shows": number;
    }>;
  }>(`/api/admin/reports/class-performance?${reportParams(range, filters)}`);
  return items.map((row) => ({
    classId: row.classId,
    className: row.Class,
    sessions: row.Sessions,
    // Absent (not 0) when the actor lacks the matching read permission.
    revenuePhp: row.Revenue !== undefined ? phpToNumber(row.Revenue) : 0,
    occupancy: row.Occupancy ?? 0,
    noShows: row["No-shows"],
  }));
}

export async function getCoachCosts(
  fetcher: ApiFetcher,
  range: ReportDateRange,
  filters?: AdminReportFilters,
): Promise<CoachCostRow[]> {
  const { items } = await fetcher<{
    items: Array<{
      coachId: string;
      Coach: string;
      Sessions: number;
      "Coach Cost": string;
      "Related Revenue": string;
    }>;
  }>(`/api/admin/reports/coach-costs?${reportParams(range, filters)}`);
  return items.map((row) => ({
    coachId: row.coachId,
    coachName: row.Coach,
    sessions: row.Sessions,
    coachCostPhp: phpToNumber(row["Coach Cost"]),
    relatedRevenuePhp: phpToNumber(row["Related Revenue"]),
  }));
}

export async function getSessionPerformance(
  fetcher: ApiFetcher,
  range: ReportDateRange,
  filters?: AdminReportFilters,
  page?: { page?: number; pageSize?: number },
): Promise<{ page: number; pageSize: number; total: number; items: SessionPerformanceRow[] }> {
  const params = reportParams(range, filters);
  if (page?.page) params.set("page", String(page.page));
  if (page?.pageSize) params.set("pageSize", String(page.pageSize));
  const body = await fetcher<{
    page: number;
    pageSize: number;
    total: number;
    items: Array<{
      sessionId: string;
      "Date/Time": string;
      Class: string;
      Capacity: number;
      Confirmed: number;
      Revenue?: string;
      Cost?: string;
    }>;
  }>(`/api/admin/reports/session-performance?${params}`);
  return {
    page: body.page,
    pageSize: body.pageSize,
    total: body.total,
    items: body.items.map((row) => ({
      sessionId: row.sessionId,
      startsAt: row["Date/Time"],
      className: row.Class,
      capacity: row.Capacity,
      confirmed: row.Confirmed,
      revenuePhp: row.Revenue !== undefined ? phpToNumber(row.Revenue) : 0,
      coachCostPhp: row.Cost !== undefined ? phpToNumber(row.Cost) : 0,
    })),
  };
}

export async function getSessionReport(
  fetcher: ApiFetcher,
  id: string,
): Promise<SessionReportDrilldown | null> {
  const row = await fetcher<{
    sessionId: string;
    className: string;
    name: string | null;
    startsAt: string;
    Capacity: number;
    Confirmed: number;
    Held: number;
    Available: number;
    Waitlisted: number;
    "Checked In": number;
    "No-show": number;
    "Customer Price"?: string;
    "Gross Revenue"?: string;
    Refunds?: string;
    "Coach Cost"?: string;
    "Gross Contribution"?: string;
    Occupancy: number;
    "Attendance Utilisation": number;
  }>(`/api/admin/reports/sessions/${id}`).catch(() => null);
  if (!row) return null;
  return {
    sessionId: row.sessionId,
    className: row.className,
    name: row.name,
    startsAt: row.startsAt,
    capacity: row.Capacity,
    confirmed: row.Confirmed,
    held: row.Held,
    available: row.Available,
    waitlisted: row.Waitlisted,
    checkedIn: row["Checked In"],
    noShow: row["No-show"],
    customerPricePhp: row["Customer Price"] !== undefined ? phpToNumber(row["Customer Price"]) : 0,
    grossRevenuePhp: row["Gross Revenue"] !== undefined ? phpToNumber(row["Gross Revenue"]) : 0,
    refundsPhp: row.Refunds !== undefined ? phpToNumber(row.Refunds) : 0,
    coachCostPhp: row["Coach Cost"] !== undefined ? phpToNumber(row["Coach Cost"]) : 0,
    grossContributionPhp:
      row["Gross Contribution"] !== undefined ? phpToNumber(row["Gross Contribution"]) : 0,
    occupancy: row.Occupancy,
    attendanceUtilisation: row["Attendance Utilisation"],
  };
}

/** Composes the four report calls into one `AdminReports` (WIRE-1802, #372). */
export async function getAdminReports(
  fetcher: ApiFetcher,
  filters: AdminReportFilters,
): Promise<AdminReports> {
  const range = { from: filters.from, to: filters.to };
  const [overview, classPerformance, coachCosts, sessionPerformanceResult] = await Promise.all([
    getSalesOverview(fetcher, range, filters),
    getClassPerformance(fetcher, range, filters),
    getCoachCosts(fetcher, range, filters),
    getSessionPerformance(fetcher, range, filters, { pageSize: 100 }),
  ]);
  return {
    overview,
    classPerformance,
    coachCosts,
    sessionPerformance: sessionPerformanceResult.items,
  };
}
