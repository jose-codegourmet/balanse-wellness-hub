-- Classes are independent catalogue entries; every session has one or more coaches.
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.sessions WHERE "coachId" IS NULL) THEN
    RAISE EXCEPTION 'Assign a coach to every existing session before applying session_coach_assignments (including drafts and cancelled sessions).';
  END IF;
END $$;

CREATE TABLE public.session_coaches (
  id text NOT NULL PRIMARY KEY,
  "sessionId" text NOT NULL,
  "coachId" text NOT NULL,
  "coachRate" numeric(12,2) NOT NULL CHECK ("coachRate" >= 0),
  "coachRateType" public.coach_rate_type NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL,
  CONSTRAINT "session_coaches_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "session_coaches_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public.coaches(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "session_coaches_sessionId_coachId_key" ON public.session_coaches("sessionId", "coachId");
CREATE INDEX "session_coaches_coachId_idx" ON public.session_coaches("coachId");

-- Preserve historical rate snapshots exactly, including inactive coaches.
INSERT INTO public.session_coaches (id, "sessionId", "coachId", "coachRate", "coachRateType", "createdAt", "updatedAt")
SELECT 'sc_' || gen_random_uuid()::text, id, "coachId", "coachRate", "coachRateType", "createdAt", "updatedAt"
FROM public.sessions;

ALTER TABLE public.session_coaches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.session_coaches FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_coaches TO authenticated;
CREATE POLICY session_coaches_admin_all ON public.session_coaches FOR ALL TO authenticated
  USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- Keep old class-level associations recoverable, but outside the public catalogue.
CREATE TABLE app_private.legacy_class_coaches AS TABLE public.class_coaches;
ALTER TABLE app_private.legacy_class_coaches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app_private.legacy_class_coaches FROM PUBLIC, anon, authenticated;
DROP TABLE public.class_coaches;

CREATE OR REPLACE FUNCTION app_private.guard_session_coach_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_coach public.coaches;
BEGIN
  -- A parent write serializes concurrent removals (also safe at repeatable read).
  IF TG_OP = 'DELETE' THEN
    UPDATE public.sessions SET "updatedAt" = CURRENT_TIMESTAMP WHERE id = OLD."sessionId";
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND
    (NEW."sessionId", NEW."coachId", NEW."coachRate", NEW."coachRateType") IS DISTINCT FROM
    (OLD."sessionId", OLD."coachId", OLD."coachRate", OLD."coachRateType") THEN
    RAISE EXCEPTION 'Session coach rate snapshots are immutable; remove/add assignments instead.' USING ERRCODE = '23514';
  END IF;
  UPDATE public.sessions SET "updatedAt" = CURRENT_TIMESTAMP WHERE id = NEW."sessionId";
  IF TG_OP = 'INSERT' THEN
    SELECT * INTO v_coach FROM public.coaches WHERE id = NEW."coachId" FOR SHARE;
    IF NOT FOUND OR NOT v_coach.active THEN
      RAISE EXCEPTION 'New session assignments require an active coach.' USING ERRCODE = '23514';
    END IF;
    NEW."coachRate" := v_coach."defaultRate";
    NEW."coachRateType" := v_coach."rateType";
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION app_private.guard_session_coach_assignment() FROM PUBLIC;
CREATE TRIGGER session_coach_assignment_guard BEFORE INSERT OR UPDATE OR DELETE ON public.session_coaches
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_session_coach_assignment();

CREATE OR REPLACE FUNCTION app_private.require_session_coach()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_session_id text;
BEGIN
  IF TG_TABLE_NAME = 'sessions' THEN v_session_id := NEW.id;
  ELSE v_session_id := OLD."sessionId";
  END IF;
  IF EXISTS (SELECT 1 FROM public.sessions WHERE id = v_session_id)
     AND NOT EXISTS (SELECT 1 FROM public.session_coaches WHERE "sessionId" = v_session_id) THEN
    RAISE EXCEPTION 'Every session must have at least one coach.' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION app_private.require_session_coach() FROM PUBLIC;
CREATE CONSTRAINT TRIGGER session_requires_coach AFTER INSERT OR UPDATE ON public.sessions
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION app_private.require_session_coach();
CREATE CONSTRAINT TRIGGER assignment_requires_coach AFTER DELETE OR UPDATE ON public.session_coaches
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION app_private.require_session_coach();

CREATE OR REPLACE FUNCTION app_private.session_coach_cost(p_session_id text)
RETURNS numeric LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT COALESCE(SUM(ROUND(sc."coachRate" * CASE WHEN sc."coachRateType" = 'PER_HOUR'
    THEN EXTRACT(EPOCH FROM (s."endsAt" - s."startsAt")) / 3600 ELSE 1 END, 2)), 0)
  FROM public.sessions s JOIN public.session_coaches sc ON sc."sessionId" = s.id
  WHERE s.id = p_session_id;
$$;
REVOKE ALL ON FUNCTION app_private.session_coach_cost(text) FROM PUBLIC;

-- Reporting replacements follow before removing the old columns.

CREATE OR REPLACE FUNCTION app_private.session_matches_report_filters(
  p_session public.sessions,
  p_from timestamptz,
  p_to timestamptz,
  p_class_id text,
  p_coach_id text,
  p_session_status "session_status"
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT p_session."startsAt" >= p_from
     AND p_session."startsAt" < p_to
     AND (p_class_id IS NULL OR p_session."classId" = p_class_id)
     AND (p_coach_id IS NULL OR EXISTS (SELECT 1 FROM public.session_coaches sc WHERE sc."sessionId" = p_session.id AND sc."coachId" = p_coach_id))
     AND (p_session_status IS NULL OR p_session.status = p_session_status);
$$;

CREATE OR REPLACE FUNCTION public.report_coach_costs(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status public.session_status DEFAULT NULL
) RETURNS TABLE ("coachName" text, sessions integer, "coachCost" numeric, "relatedRevenue" numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH per_session AS (
    SELECT s.id, s."startsAt", s."endsAt",
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice" AS revenue
    FROM public.sessions s LEFT JOIN public.bookings b ON b."sessionId" = s.id
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
    GROUP BY s.id
  )
  SELECT co.name, COUNT(ps.id)::integer,
    SUM(ROUND(sc."coachRate" * CASE WHEN sc."coachRateType" = 'PER_HOUR'
      THEN EXTRACT(EPOCH FROM (ps."endsAt" - ps."startsAt")) / 3600 ELSE 1 END, 2)),
    COALESCE(SUM(ps.revenue), 0)
  FROM per_session ps
  JOIN public.session_coaches sc ON sc."sessionId" = ps.id
  JOIN public.coaches co ON co.id = sc."coachId"
  WHERE p_coach_id IS NULL OR sc."coachId" = p_coach_id
  GROUP BY co.id, co.name;
$$;
COMMENT ON FUNCTION public.report_coach_costs IS
  'Per-assignment snapshot cost. Related revenue is full session revenue per coach; it is not additive across coaches.';

CREATE OR REPLACE FUNCTION public.report_session_performance(
  p_from timestamptz,
  p_to timestamptz,
  p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL,
  p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "startsAt" timestamptz,
  "className" text,
  capacity integer,
  confirmed integer,
  revenue numeric,
  "coachCost" numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s."startsAt",
    c.name,
    s.capacity,
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
$$;

CREATE OR REPLACE FUNCTION public.report_session_drilldown(p_session_id text)
RETURNS TABLE (
  capacity integer,
  confirmed integer,
  held integer,
  available integer,
  waitlisted integer,
  "checkedIn" integer,
  "noShow" integer,
  "customerPrice" numeric,
  "grossRevenue" numeric,
  refunds numeric,
  "coachCost" numeric,
  "grossContribution" numeric,
  occupancy numeric,
  "attendanceUtilisation" numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE s.id = p_session_id
  GROUP BY s.id;
$$;


DROP FUNCTION IF EXISTS app_private.snapshot_session_from_coach();
ALTER TABLE public.sessions DROP COLUMN "coachId", DROP COLUMN "coachRate", DROP COLUMN "coachRateType";
COMMIT;
