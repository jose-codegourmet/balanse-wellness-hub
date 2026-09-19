import { requireAdmin, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, pagination, requiredDateRange, searchParams } from "../http";
import { money } from "../presenters";
import { REPORTS_PERFORMANCE_BUDGET } from "../settings";
import {
  type ReportFilters,
  reportClassPerformance,
  reportCoachCosts,
  reportSalesOverview,
  reportSessionDrilldown,
  reportSessionPerformance,
} from "../sql";

function filters(req: Request): ReportFilters {
  const params = searchParams(req);
  const { from, to } = requiredDateRange(params);
  return {
    from,
    to,
    classId: params.get("classId"),
    coachId: params.get("coachId"),
    sessionStatus: params.get("sessionStatus") ?? params.get("status"),
  };
}

function assertNoProfit(payload: unknown): void {
  if (/profit/i.test(JSON.stringify(payload))) {
    throw new ApiError(500, "internal_error", "Reports must not contain a field named profit.");
  }
}

export async function getSalesOverview(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const row = (await reportSalesOverview(deps, filters(req)))[0];
  const body = {
    "Gross Sales": money(row?.grossSales),
    Refunds: money(row?.refunds),
    "Net Sales": money(row?.netSales),
    "Paid Bookings": Number(row?.paidBookings ?? 0),
    performanceBudget: REPORTS_PERFORMANCE_BUDGET,
  };
  assertNoProfit(body);
  return ok(body);
}

export async function getClassPerformance(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const rows = await reportClassPerformance(deps, filters(req));
  const body = {
    items: rows.map((row) => ({
      Class: row.className,
      Sessions: Number(row.sessions),
      Revenue: money(row.revenue),
      Occupancy: Number(row.occupancy),
      "No-shows": Number(row.noShows),
    })),
  };
  assertNoProfit(body);
  return ok(body);
}

export async function getCoachCosts(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const rows = await reportCoachCosts(deps, filters(req));
  const body = {
    items: rows.map((row) => ({
      Coach: row.coachName,
      Sessions: Number(row.sessions),
      "Coach Cost": money(row.coachCost),
      "Related Revenue": money(row.relatedRevenue),
    })),
  };
  assertNoProfit(body);
  return ok(body);
}

export async function getSessionPerformance(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const { page, pageSize, skip } = pagination(searchParams(req));
  const rows = await reportSessionPerformance(deps, filters(req));
  const pageRows = rows.slice(skip, skip + pageSize);
  const body = {
    page,
    pageSize,
    total: rows.length,
    performanceBudget: REPORTS_PERFORMANCE_BUDGET,
    items: pageRows.map((row) => ({
      "Date/Time": row.startsAt.toISOString(),
      Class: row.className,
      Capacity: Number(row.capacity),
      Confirmed: Number(row.confirmed),
      Revenue: money(row.revenue),
      Cost: money(row.coachCost),
    })),
  };
  assertNoProfit(body);
  return ok(body);
}

export async function getSessionReport(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const row = (await reportSessionDrilldown(deps, id))[0];
  if (!row) throw new ApiError(404, "session_not_found", "Session not found.");
  const body = {
    Capacity: Number(row.capacity),
    Confirmed: Number(row.confirmed),
    Held: Number(row.held),
    Available: Number(row.available),
    Waitlisted: Number(row.waitlisted),
    "Checked In": Number(row.checkedIn),
    "No-show": Number(row.noShow),
    "Customer Price": money(row.customerPrice),
    "Gross Revenue": money(row.grossRevenue),
    Refunds: money(row.refunds),
    "Coach Cost": money(row.coachCost),
    "Gross Contribution": money(row.grossContribution),
    Occupancy: Number(row.occupancy),
    "Attendance Utilisation": Number(row.attendanceUtilisation),
  };
  assertNoProfit(body);
  return ok(body);
}
