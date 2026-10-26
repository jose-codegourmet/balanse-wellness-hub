-- #382: sessions.name is varchar(120), while this report returns text.
-- Preserve the existing function signature, permission check, and execute grants.
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
    s.name::text,
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
