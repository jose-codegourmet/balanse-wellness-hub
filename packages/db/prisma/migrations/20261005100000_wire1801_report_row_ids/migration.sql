-- WIRE-1801 (#372) — the admin reports screen needs a stable row id per
-- class/coach/session for `AdminDataTable`'s `getRowId`, and the session
-- performance table's drill-down link needs a *real* session id to route to
-- `/reports/{sessionId}` → `report_session_drilldown`. None of the three
-- aggregate report functions returned one (name-only), even though every
-- one already groups by the underlying id internally. This just adds the id
-- column to each `RETURNS TABLE` and `SELECT` — no other behavior changes.

BEGIN;

-- PostgreSQL cannot replace a function when its RETURNS TABLE row type changes.
-- These functions have no dependent database objects on the hosted project;
-- use RESTRICT (the default) so an unexpected dependency aborts safely.
DROP FUNCTION IF EXISTS public.report_class_performance_v2(timestamptz, timestamptz, text, text, public.session_status);
DROP FUNCTION IF EXISTS public.report_coach_costs(timestamptz, timestamptz, text, text, public.session_status);
DROP FUNCTION IF EXISTS public.report_session_performance(timestamptz, timestamptz, text, text, public.session_status);
DROP FUNCTION IF EXISTS public.report_session_drilldown(text);

CREATE OR REPLACE FUNCTION public.report_class_performance_v2(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "classId" text, "className" text, sessions integer, revenue numeric,
  occupancy numeric, "noShows" integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_include_sales boolean :=
    auth.uid() IS NULL OR app_private.has_permission(auth.uid(), 'reports.sales.read');
BEGIN
  PERFORM app_private.assert_report_permission('reports.capacity.read');
  RETURN QUERY
  WITH scoped AS (
    SELECT s.*
    FROM sessions s
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  ),
  per_session AS (
    SELECT
      s.id, s."classId", s.capacity, s."customerPrice",
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) AS paid,
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED')) AS confirmed,
      COUNT(*) FILTER (WHERE b.status = 'NO_SHOW') AS no_shows
    FROM scoped s
    LEFT JOIN bookings b ON b."sessionId" = s.id
    GROUP BY s.id, s."classId", s.capacity, s."customerPrice"
  )
  SELECT
    c.id,
    c.name,
    COUNT(ps.id)::integer,
    CASE WHEN v_include_sales THEN COALESCE(SUM(ps.paid * ps."customerPrice"), 0) ELSE 0 END,
    CASE WHEN SUM(ps.capacity) = 0 THEN 0 ELSE SUM(ps.confirmed)::numeric / SUM(ps.capacity) END,
    SUM(ps.no_shows)::integer
  FROM per_session ps
  JOIN classes c ON c.id = ps."classId"
  GROUP BY c.id, c.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_coach_costs(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status public.session_status DEFAULT NULL
)
RETURNS TABLE (
  "coachId" text, "coachName" text, sessions integer, "coachCost" numeric, "relatedRevenue" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.coach_costs.read');
  RETURN QUERY
  WITH per_session AS (
    SELECT s.id, s."startsAt", s."endsAt",
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice" AS revenue
    FROM public.sessions s LEFT JOIN public.bookings b ON b."sessionId" = s.id
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
    GROUP BY s.id
  )
  SELECT co.id, co.name, COUNT(ps.id)::integer,
    SUM(ROUND(sc."coachRate" * CASE WHEN sc."coachRateType" = 'PER_HOUR'
      THEN EXTRACT(EPOCH FROM (ps."endsAt" - ps."startsAt")) / 3600 ELSE 1 END, 2)),
    COALESCE(SUM(ps.revenue), 0)
  FROM per_session ps
  JOIN public.session_coaches sc ON sc."sessionId" = ps.id
  JOIN public.coaches co ON co.id = sc."coachId"
  WHERE p_coach_id IS NULL OR sc."coachId" = p_coach_id
  GROUP BY co.id, co.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_session_performance(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "sessionId" text, "startsAt" timestamptz, "className" text, capacity integer, confirmed integer,
  revenue numeric, "coachCost" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.session.read');
  RETURN QUERY
  SELECT
    s.id, s."startsAt", c.name, s.capacity,
    COUNT(*) FILTER (
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED')
    )::integer,
    COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice",
    app_private.session_coach_cost(s.id)
  FROM sessions s
  JOIN classes c ON c.id = s."classId"
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  GROUP BY s.id, s."startsAt", c.name, s.capacity, s."customerPrice", app_private.session_coach_cost(s.id);
END;
$$;

-- The session drill-down page's title needs the session's own class name,
-- occurrence name, and start time — `report_session_drilldown` returned
-- metrics only, with no way to identify which session they belong to.
CREATE OR REPLACE FUNCTION public.report_session_drilldown(p_session_id text)
RETURNS TABLE (
  "sessionId" text, "className" text, name text, "startsAt" timestamptz,
  capacity integer, confirmed integer, held integer, available integer, waitlisted integer,
  "checkedIn" integer, "noShow" integer, "customerPrice" numeric, "grossRevenue" numeric,
  refunds numeric, "coachCost" numeric, "grossContribution" numeric, occupancy numeric,
  "attendanceUtilisation" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.session.read');
  RETURN QUERY
  SELECT
    s.id,
    c.name,
    s.name,
    s."startsAt",
    s.capacity,
    COUNT(*) FILTER (
      WHERE b.status IN ('CONFIRMED', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN')
    )::integer,
    COUNT(*) FILTER (
      WHERE b.status IN ('HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED')
    )::integer,
    GREATEST(s.capacity - app_private.session_consumed_capacity(s.id), 0),
    (SELECT COUNT(*)::integer FROM waitlist_entries w WHERE w."sessionId" = s.id AND w.status = 'WAITING'),
    COUNT(*) FILTER (WHERE b.status = 'CHECKED_IN')::integer,
    COUNT(*) FILTER (WHERE b.status = 'NO_SHOW')::integer,
    s."customerPrice",
    COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice",
    COALESCE((
      SELECT SUM(r.amount) FROM refunds r
      JOIN bookings b2 ON b2.id = r."bookingId"
      WHERE b2."sessionId" = s.id AND r.status = 'REFUNDED'
    ), 0),
    app_private.session_coach_cost(s.id),
    (COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice") - app_private.session_coach_cost(s.id),
    CASE WHEN s.capacity = 0 THEN 0
      ELSE COUNT(*) FILTER (
        WHERE b.status IN ('CONFIRMED', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN')
      )::numeric / s.capacity END,
    CASE WHEN s.capacity = 0 THEN 0
      ELSE COUNT(*) FILTER (WHERE b.status = 'CHECKED_IN')::numeric / s.capacity END
  FROM sessions s
  JOIN classes c ON c.id = s."classId"
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE s.id = p_session_id
  GROUP BY s.id, c.name;
END;
$$;

-- DROP/CREATE resets function ACLs. Preserve the existing server-only access;
-- PostgreSQL otherwise grants EXECUTE to PUBLIC by default.
REVOKE ALL ON FUNCTION public.report_class_performance_v2(timestamptz, timestamptz, text, text, public.session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_coach_costs(timestamptz, timestamptz, text, text, public.session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_session_performance(timestamptz, timestamptz, text, text, public.session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_session_drilldown(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.report_class_performance_v2(timestamptz, timestamptz, text, text, public.session_status) TO service_role;
GRANT EXECUTE ON FUNCTION public.report_coach_costs(timestamptz, timestamptz, text, text, public.session_status) TO service_role;
GRANT EXECUTE ON FUNCTION public.report_session_performance(timestamptz, timestamptz, text, text, public.session_status) TO service_role;
GRANT EXECUTE ON FUNCTION public.report_session_drilldown(text) TO service_role;

COMMIT;
