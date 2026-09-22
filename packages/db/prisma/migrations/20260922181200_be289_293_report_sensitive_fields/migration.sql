-- #293: JWT report RPCs omit sales/cost columns unless the matching key is held.
-- Service-role (auth.uid() null) still returns raw figures; HTTP handlers shape them.

CREATE OR REPLACE FUNCTION public.report_class_performance_v2(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE ("className" text, sessions integer, revenue numeric, occupancy numeric, "noShows" integer)
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
    c.name,
    COUNT(ps.id)::integer,
    CASE WHEN v_include_sales THEN COALESCE(SUM(ps.paid * ps."customerPrice"), 0) ELSE 0 END,
    CASE WHEN SUM(ps.capacity) = 0 THEN 0 ELSE SUM(ps.confirmed)::numeric / SUM(ps.capacity) END,
    SUM(ps.no_shows)::integer
  FROM per_session ps
  JOIN classes c ON c.id = ps."classId"
  GROUP BY c.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_session_performance(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "startsAt" timestamptz, "className" text, capacity integer, confirmed integer,
  revenue numeric, "coachCost" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_include_sales boolean :=
    auth.uid() IS NULL OR app_private.has_permission(auth.uid(), 'reports.sales.read');
  v_include_cost boolean :=
    auth.uid() IS NULL OR app_private.has_permission(auth.uid(), 'reports.coach_costs.read');
BEGIN
  PERFORM app_private.assert_report_permission('reports.session.read');
  RETURN QUERY
  SELECT
    s."startsAt", c.name, s.capacity,
    COUNT(*) FILTER (
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED')
    )::integer,
    CASE
      WHEN v_include_sales
        THEN COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice"
      ELSE 0
    END,
    CASE WHEN v_include_cost THEN app_private.session_coach_cost(s.id) ELSE 0 END
  FROM sessions s
  JOIN classes c ON c.id = s."classId"
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  GROUP BY s.id, s."startsAt", c.name, s.capacity, s."customerPrice";
END;
$$;

CREATE OR REPLACE FUNCTION public.report_session_drilldown(p_session_id text)
RETURNS TABLE (
  capacity integer, confirmed integer, held integer, available integer, waitlisted integer,
  "checkedIn" integer, "noShow" integer, "customerPrice" numeric, "grossRevenue" numeric,
  refunds numeric, "coachCost" numeric, "grossContribution" numeric, occupancy numeric,
  "attendanceUtilisation" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_include_sales boolean :=
    auth.uid() IS NULL OR app_private.has_permission(auth.uid(), 'reports.sales.read');
  v_include_cost boolean :=
    auth.uid() IS NULL OR app_private.has_permission(auth.uid(), 'reports.coach_costs.read');
BEGIN
  PERFORM app_private.assert_report_permission('reports.session.read');
  RETURN QUERY
  SELECT
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
    CASE WHEN v_include_sales THEN s."customerPrice" ELSE 0 END,
    CASE
      WHEN v_include_sales
        THEN COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice"
      ELSE 0
    END,
    CASE
      WHEN v_include_sales THEN COALESCE((
        SELECT SUM(r.amount) FROM refunds r
        JOIN bookings b2 ON b2.id = r."bookingId"
        WHERE b2."sessionId" = s.id AND r.status = 'REFUNDED'
      ), 0)
      ELSE 0
    END,
    CASE WHEN v_include_cost THEN app_private.session_coach_cost(s.id) ELSE 0 END,
    CASE
      WHEN v_include_sales AND v_include_cost
        THEN (COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice")
          - app_private.session_coach_cost(s.id)
      ELSE 0
    END,
    CASE WHEN s.capacity = 0 THEN 0
      ELSE COUNT(*) FILTER (
        WHERE b.status IN ('CONFIRMED', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN')
      )::numeric / s.capacity END,
    CASE WHEN s.capacity = 0 THEN 0
      ELSE COUNT(*) FILTER (WHERE b.status = 'CHECKED_IN')::numeric / s.capacity END
  FROM sessions s
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE s.id = p_session_id
  GROUP BY s.id;
END;
$$;

REVOKE ALL ON FUNCTION public.report_class_performance_v2(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_session_performance(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_session_drilldown(text) FROM PUBLIC, anon, authenticated;
