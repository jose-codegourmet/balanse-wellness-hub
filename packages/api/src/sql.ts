import type { ApiDeps } from "./deps";

export async function updateSessionCapacity(
  deps: ApiDeps,
  sessionId: string,
  capacity: number,
): Promise<number> {
  const rows = await deps.prisma.$queryRawUnsafe<Array<{ v: number }>>(
    `SELECT public.update_session_capacity($1, $2) AS v`,
    sessionId,
    capacity,
  );
  return Number(rows[0]?.v ?? 0);
}

export async function sessionConsumedCapacity(deps: ApiDeps, sessionId: string): Promise<number> {
  const rows = await deps.prisma.$queryRawUnsafe<Array<{ v: number }>>(
    `SELECT public.session_consumed_capacity($1) AS v`,
    sessionId,
  );
  return Number(rows[0]?.v ?? 0);
}

export async function sessionsConsumedCapacity(
  deps: ApiDeps,
  sessionIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (sessionIds.length === 0) return map;
  const rows = await deps.prisma.$queryRawUnsafe<Array<{ id: string; v: number }>>(
    `SELECT s.id, public.session_consumed_capacity(s.id) AS v
     FROM sessions s WHERE s.id = ANY($1::text[])`,
    sessionIds,
  );
  for (const row of rows) map.set(row.id, Number(row.v));
  return map;
}

export async function createReservation(
  deps: ApiDeps,
  profileId: string,
  sessionId: string,
  acceptanceVersionIds: string[],
): Promise<{
  bookingId: string;
  kind: "hold" | "waitlist";
  waitlistEntryId: string | null;
  holdExpiresAt: string | null;
}> {
  const rows = await deps.prisma.$queryRawUnsafe<
    Array<{
      result: {
        bookingId: string;
        kind: "hold" | "waitlist";
        waitlistEntryId: string | null;
        holdExpiresAt: string | null;
      };
    }>
  >(
    `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
    profileId,
    sessionId,
    acceptanceVersionIds,
  );
  return rows[0].result;
}

export async function submitCancellationRequest(
  deps: ApiDeps,
  bookingId: string,
  requesterId: string,
  reason: string | null,
): Promise<string> {
  const rows = await deps.prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT public.submit_cancellation_request($1, $2::uuid, $3) AS id`,
    bookingId,
    requesterId,
    reason,
  );
  return rows[0].id;
}

export async function submitRescheduleRequest(
  deps: ApiDeps,
  bookingId: string,
  requesterId: string,
  targetSessionId: string,
  note: string | null,
): Promise<string> {
  const rows = await deps.prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT public.submit_reschedule_request($1, $2::uuid, $3, $4) AS id`,
    bookingId,
    requesterId,
    targetSessionId,
    note,
  );
  return rows[0].id;
}

export async function resolveCancellationRequest(
  deps: ApiDeps,
  requestId: string,
  resolverId: string,
  resolution: "COMPLETED" | "REJECTED",
  note: string | null,
): Promise<void> {
  await deps.prisma.$executeRawUnsafe(
    `SELECT public.resolve_cancellation_request($1, $2, $3::request_resolution, $4)`,
    requestId,
    resolverId,
    resolution,
    note,
  );
}

export async function resolveRescheduleRequest(
  deps: ApiDeps,
  requestId: string,
  resolverId: string,
  resolution: "COMPLETED" | "REJECTED",
  note: string | null,
): Promise<void> {
  await deps.prisma.$executeRawUnsafe(
    `SELECT public.resolve_reschedule_request($1, $2, $3::request_resolution, $4)`,
    requestId,
    resolverId,
    resolution,
    note,
  );
}

export async function rejectBooking(
  deps: ApiDeps,
  bookingId: string,
  actorId: string,
  reason: string,
): Promise<void> {
  await deps.prisma.$executeRawUnsafe(
    `SELECT public.reject_booking($1, $2, $3)`,
    bookingId,
    actorId,
    reason,
  );
}

export async function confirmBooking(
  deps: ApiDeps,
  bookingId: string,
  actorId: string,
): Promise<void> {
  await deps.prisma.$executeRawUnsafe(
    `SELECT public.transition_booking($1, 'CONFIRMED'::booking_status, 'STAFF'::audit_actor_type, $2, 'booking.confirm', '{}'::jsonb)`,
    bookingId,
    actorId,
  );
}

export async function checkInBooking(
  deps: ApiDeps,
  bookingId: string,
  actorId: string,
): Promise<void> {
  await deps.prisma.$executeRawUnsafe(`SELECT public.check_in_booking($1, $2)`, bookingId, actorId);
}

export async function markNoShow(deps: ApiDeps, bookingId: string, actorId: string): Promise<void> {
  await deps.prisma.$executeRawUnsafe(`SELECT public.mark_no_show($1, $2)`, bookingId, actorId);
}

export async function transitionRefund(
  deps: ApiDeps,
  refundId: string,
  to: "REFUND_PENDING" | "REFUNDED",
  actorId: string,
  note: string | null,
): Promise<void> {
  await deps.prisma.$executeRawUnsafe(
    `SELECT public.transition_refund($1, $2::refund_status, $3, $4)`,
    refundId,
    to,
    actorId,
    note,
  );
}

export async function sessionPastCutoff(deps: ApiDeps, sessionId: string): Promise<boolean> {
  const rows = await deps.prisma.$queryRawUnsafe<Array<{ v: boolean }>>(
    `SELECT app_private.session_is_past_cutoff($1) AS v`,
    sessionId,
  );
  return Boolean(rows[0]?.v);
}

export type ReportFilters = {
  from: Date;
  to: Date;
  classId: string | null;
  coachId: string | null;
  sessionStatus: string | null;
};

export async function reportSalesOverview(deps: ApiDeps, filters: ReportFilters) {
  return deps.prisma.$queryRawUnsafe<
    Array<{ grossSales: unknown; refunds: unknown; netSales: unknown; paidBookings: number }>
  >(
    `SELECT * FROM public.report_sales_overview($1, $2, $3, $4, $5::session_status)`,
    filters.from,
    filters.to,
    filters.classId,
    filters.coachId,
    filters.sessionStatus,
  );
}

export async function reportClassPerformance(deps: ApiDeps, filters: ReportFilters) {
  return deps.prisma.$queryRawUnsafe<
    Array<{
      className: string;
      sessions: number;
      revenue: unknown;
      occupancy: unknown;
      noShows: number;
    }>
  >(
    `SELECT * FROM public.report_class_performance_v2($1, $2, $3, $4, $5::session_status)`,
    filters.from,
    filters.to,
    filters.classId,
    filters.coachId,
    filters.sessionStatus,
  );
}

export async function reportCoachCosts(deps: ApiDeps, filters: ReportFilters) {
  return deps.prisma.$queryRawUnsafe<
    Array<{ coachName: string; sessions: number; coachCost: unknown; relatedRevenue: unknown }>
  >(
    `SELECT * FROM public.report_coach_costs($1, $2, $3, $4, $5::session_status)`,
    filters.from,
    filters.to,
    filters.classId,
    filters.coachId,
    filters.sessionStatus,
  );
}

export async function reportSessionPerformance(deps: ApiDeps, filters: ReportFilters) {
  return deps.prisma.$queryRawUnsafe<
    Array<{
      startsAt: Date;
      className: string;
      capacity: number;
      confirmed: number;
      revenue: unknown;
      coachCost: unknown;
    }>
  >(
    `SELECT * FROM public.report_session_performance($1, $2, $3, $4, $5::session_status)`,
    filters.from,
    filters.to,
    filters.classId,
    filters.coachId,
    filters.sessionStatus,
  );
}

export async function reportSessionDrilldown(deps: ApiDeps, sessionId: string) {
  return deps.prisma.$queryRawUnsafe<
    Array<{
      capacity: number;
      confirmed: number;
      held: number;
      available: number;
      waitlisted: number;
      checkedIn: number;
      noShow: number;
      customerPrice: unknown;
      grossRevenue: unknown;
      refunds: unknown;
      coachCost: unknown;
      grossContribution: unknown;
      occupancy: unknown;
      attendanceUtilisation: unknown;
    }>
  >(`SELECT * FROM public.report_session_drilldown($1)`, sessionId);
}
