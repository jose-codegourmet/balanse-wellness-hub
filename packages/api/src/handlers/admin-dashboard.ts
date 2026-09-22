import {
  DASHBOARD_SERIES_WINDOW_DAYS,
  type DashboardMetricId,
  type MetricSeries,
} from "@balanse/domain";
import { requireAdmin, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok } from "../http";
import { money } from "../presenters";
import { shapeDashboard } from "../sensitive";

type DayRow = {
  day: Date;
  gross_sales: number;
  occupancy: number;
  session_count: number;
  coach_cost: number;
};

export async function getAdminDashboard(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const snapshot = await operationalSnapshot(deps);
  const series = await dashboardSeries(deps, DASHBOARD_SERIES_WINDOW_DAYS);
  const prior = priorDayFromSeries(series);
  const raw = {
    ...snapshot,
    series,
    comparisons: {
      todaysSalesPhp: {
        current: snapshot.todaysSalesPhp,
        prior: prior.gross_sales,
        priorWindow: "previous_manila_day" as const,
      },
      todaysOccupancy: {
        current: snapshot.todaysOccupancy,
        prior: prior.occupancy,
        priorWindow: "previous_manila_day" as const,
      },
      coachCostTodayPhp: {
        current: snapshot.coachCostTodayPhp,
        prior: prior.coach_cost,
        priorWindow: "previous_manila_day" as const,
      },
      pendingPayments: { current: snapshot.pendingPayments, prior: null, priorWindow: null },
      cancellations: { current: snapshot.cancellations, prior: null, priorWindow: null },
      reschedules: { current: snapshot.reschedules, prior: null, priorWindow: null },
      waitlisted: { current: snapshot.waitlisted, prior: null, priorWindow: null },
    },
    gaps: {
      queueDepthHistory:
        "Pending payment / cancellation / reschedule / waitlist counts are live queues. No historical snapshot exists, so FE-ADM-022 must not invent a trend arrow for them.",
    },
  };
  const body = shapeDashboard(actor, raw);
  if (/profit/i.test(JSON.stringify(body))) {
    throw new ApiError(500, "internal_error", "Dashboard must not contain a field named profit.");
  }
  return ok(body);
}

export async function getAdminDashboardMetrics(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const series = await dashboardSeries(deps, DASHBOARD_SERIES_WINDOW_DAYS);
  return ok({
    grain: "day",
    timezone: "Asia/Manila",
    windowDays: DASHBOARD_SERIES_WINDOW_DAYS,
    series,
  });
}

async function operationalSnapshot(deps: ApiDeps) {
  const rows = await deps.prisma.$queryRawUnsafe<
    Array<{
      todays_classes: number;
      pending_payments: number;
      cancellations: number;
      reschedules: number;
      waitlisted: number;
      todays_sales: number;
      pending_refunds: number;
      todays_occupancy: number;
      coach_cost_today: number;
    }>
  >(`
    WITH today AS (
      SELECT (timezone('Asia/Manila', now()))::date AS d
    )
    SELECT
      (SELECT COUNT(*) FROM sessions s, today
        WHERE (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = today.d
          AND s.status IN ('PUBLISHED', 'CANCELLED')) AS todays_classes,
      (SELECT COUNT(*) FROM payments p
        WHERE p.method = 'GCASH' AND p.status = 'PROOF_SUBMITTED') AS pending_payments,
      (SELECT COUNT(*) FROM cancellation_requests WHERE resolution = 'OPEN') AS cancellations,
      (SELECT COUNT(*) FROM reschedule_requests WHERE resolution = 'OPEN') AS reschedules,
      (SELECT COUNT(*) FROM bookings WHERE status = 'WAITLISTED') AS waitlisted,
      (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
        JOIN bookings b ON b.id = p."bookingId"
        JOIN sessions s ON s.id = b."sessionId", today
        WHERE p.status IN ('VERIFIED', 'CASH_RECEIVED')
          AND b.status NOT IN ('WAITLISTED', 'HELD_AWAITING_PAYMENT')
          AND (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = today.d) AS todays_sales,
      (SELECT COALESCE(SUM(r.amount), 0) FROM refunds r
        WHERE r.status = 'REFUND_PENDING') AS pending_refunds,
      (SELECT CASE WHEN COALESCE(SUM(s.capacity), 0) = 0 THEN 0
        ELSE COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN'))::numeric
             / NULLIF(SUM(DISTINCT s.capacity), 0) END
        FROM sessions s
        LEFT JOIN bookings b ON b."sessionId" = s.id, today
        WHERE (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = today.d
          AND s.status = 'PUBLISHED') AS todays_occupancy,
      (SELECT COALESCE(SUM(app_private.session_coach_cost(s.id)), 0) FROM sessions s, today
        WHERE (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = today.d
          AND s.status IN ('PUBLISHED', 'CANCELLED')) AS coach_cost_today
  `);
  const row = rows[0];
  const todaysSchedule = await deps.prisma.gymSession.findMany({
    where: {
      status: { in: ["PUBLISHED", "CANCELLED"] },
    },
    include: {
      gymClass: true,
      coaches: { select: { coach: { select: { id: true, name: true, photoKey: true } } } },
    },
    orderBy: { startsAt: "asc" },
    take: 40,
  });
  const today = manilaToday();
  return {
    todaysClasses: Number(row?.todays_classes ?? 0),
    pendingPayments: Number(row?.pending_payments ?? 0),
    cancellations: Number(row?.cancellations ?? 0),
    reschedules: Number(row?.reschedules ?? 0),
    waitlisted: Number(row?.waitlisted ?? 0),
    attention: {
      payments: Number(row?.pending_payments ?? 0),
      cancellations: Number(row?.cancellations ?? 0),
      reschedules: Number(row?.reschedules ?? 0),
    },
    todaysSalesPhp: Number(row?.todays_sales ?? 0),
    pendingRefundsPhp: Number(row?.pending_refunds ?? 0),
    todaysOccupancy: Number(row?.todays_occupancy ?? 0),
    coachCostTodayPhp: Number(row?.coach_cost_today ?? 0),
    todaysSchedule: todaysSchedule
      .filter((session) => manilaYmd(session.startsAt) === today)
      .map((session) => ({
        id: session.id,
        className: session.gymClass.name,
        coachName: session.coaches.map(({ coach }) => coach.name).join(" & "),
        coaches: session.coaches.map(({ coach }) => coach),
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        capacity: session.capacity,
        customerPrice: money(session.customerPrice),
      })),
  };
}

async function dashboardSeries(deps: ApiDeps, windowDays: number): Promise<MetricSeries[]> {
  const rows = await deps.prisma.$queryRawUnsafe<DayRow[]>(
    `
    WITH bounds AS (
      SELECT
        (timezone('Asia/Manila', now()))::date - ($1::int - 1) AS start_day,
        (timezone('Asia/Manila', now()))::date AS end_day
    ),
    days AS (
      SELECT generate_series(bounds.start_day, bounds.end_day, interval '1 day')::date AS day
      FROM bounds
    )
    SELECT
      days.day,
      COALESCE((
        SELECT SUM(p.amount) FROM payments p
        JOIN bookings b ON b.id = p."bookingId"
        JOIN sessions s ON s.id = b."sessionId"
        WHERE p.status IN ('VERIFIED', 'CASH_RECEIVED')
          AND b.status NOT IN ('WAITLISTED', 'HELD_AWAITING_PAYMENT')
          AND (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = days.day
      ), 0) AS gross_sales,
      COALESCE((
        SELECT CASE WHEN COALESCE(SUM(s.capacity), 0) = 0 THEN 0
          ELSE COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN'))::numeric
               / NULLIF(SUM(DISTINCT s.capacity), 0) END
        FROM sessions s
        LEFT JOIN bookings b ON b."sessionId" = s.id
        WHERE s.status = 'PUBLISHED'
          AND (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = days.day
      ), 0) AS occupancy,
      (
        SELECT COUNT(*) FROM sessions s
        WHERE s.status IN ('PUBLISHED', 'CANCELLED')
          AND (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = days.day
      ) AS session_count,
      COALESCE((
        SELECT SUM(app_private.session_coach_cost(s.id)) FROM sessions s
        WHERE s.status IN ('PUBLISHED', 'CANCELLED')
          AND (s."startsAt" AT TIME ZONE 'Asia/Manila')::date = days.day
      ), 0) AS coach_cost
    FROM days
    ORDER BY days.day
    `,
    windowDays,
  );

  const metrics: DashboardMetricId[] = ["gross_sales", "occupancy", "session_count", "coach_cost"];
  return metrics.map((metric) => ({
    metric,
    grain: "day",
    timezone: "Asia/Manila",
    windowDays,
    points: rows.map((row) => ({
      date: toYmd(row.day),
      value: Number(row[metric] ?? 0),
    })),
  }));
}

function priorDayFromSeries(series: MetricSeries[]) {
  const pick = (id: DashboardMetricId) => {
    const points = series.find((item) => item.metric === id)?.points ?? [];
    return points.length >= 2 ? (points[points.length - 2]?.value ?? null) : null;
  };
  return {
    gross_sales: pick("gross_sales"),
    occupancy: pick("occupancy"),
    coach_cost: pick("coach_cost"),
  };
}

function manilaToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

function manilaYmd(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(value);
}

function toYmd(value: Date): string {
  if (value instanceof Date) return manilaYmd(value);
  return String(value).slice(0, 10);
}
