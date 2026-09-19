-- BE-020 RLS, BE-021 storage policies, BE-022 reporting, coaches_public view.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Public coach projection (omits rate columns). Owner-bypass is intentional:
-- security_invoker would re-apply coaches RLS and hide the public catalog.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.coaches_public
WITH (security_barrier = true) AS
SELECT
  c.id,
  c.name,
  c.specialties,
  c."shortBio",
  c."photoKey",
  c.active
FROM public.coaches c
WHERE c.active = true;

COMMENT ON VIEW public.coaches_public IS
  'BE-004 public projection. Omits defaultRate/rateType. Not security_invoker so anon can read public fields without table grants on coaches.';

-- ---------------------------------------------------------------------------
-- Grants / revoke Data API defaults
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO postgres;

GRANT SELECT ON public.coaches_public TO anon, authenticated;
GRANT SELECT ON public.classes TO anon, authenticated;
GRANT SELECT ON public.sessions TO anon, authenticated;
GRANT SELECT ON public.policy_documents TO anon, authenticated;
GRANT SELECT ON public.policy_document_versions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT SELECT, INSERT ON public.booking_policy_acceptances TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT, INSERT ON public.waitlist_entries TO authenticated;
GRANT SELECT, INSERT ON public.cancellation_requests TO authenticated;
GRANT SELECT, INSERT ON public.reschedule_requests TO authenticated;

-- Admin operational tables: no default grant; service role / postgres bypass RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_coaches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.staff_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.policy_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.policy_document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.refunds TO authenticated;
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT SELECT ON public.developer_config TO postgres;

REVOKE ALL ON public.developer_config FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS enable
-- ---------------------------------------------------------------------------
ALTER TABLE public.app_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- app_meta / developer_config: no policies → Data API closed; Prisma (postgres) bypasses.
-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_self_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY staff_admin_all ON public.staff_members
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin() AND "isSystem" = false);

CREATE POLICY coaches_admin_all ON public.coaches
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY classes_public_read ON public.classes
  FOR SELECT TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY classes_admin_write ON public.classes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY class_coaches_public_read ON public.class_coaches
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY class_coaches_admin_write ON public.class_coaches
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY sessions_public_read ON public.sessions
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY sessions_admin_write ON public.sessions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY policies_public_read ON public.policy_documents
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY policies_admin_write ON public.policy_documents
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY policy_versions_public_read ON public.policy_document_versions
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY policy_versions_admin_write ON public.policy_document_versions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY bookings_self_select ON public.bookings
  FOR SELECT TO authenticated
  USING ("profileId" = auth.uid() OR public.is_admin());

CREATE POLICY bookings_self_insert ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    "profileId" = auth.uid()
    AND status IN ('WAITLISTED', 'HELD_AWAITING_PAYMENT')
  );

CREATE POLICY bookings_self_update ON public.bookings
  FOR UPDATE TO authenticated
  USING ("profileId" = auth.uid())
  WITH CHECK (
    "profileId" = auth.uid()
    AND status IN (
      'WAITLISTED', 'HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED',
      'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED'
    )
  );

CREATE POLICY bookings_admin_all ON public.bookings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY acceptances_self_select ON public.booking_policy_acceptances
  FOR SELECT TO authenticated
  USING ("profileId" = auth.uid() OR public.is_admin());

CREATE POLICY acceptances_self_insert ON public.booking_policy_acceptances
  FOR INSERT TO authenticated
  WITH CHECK ("profileId" = auth.uid());

CREATE POLICY acceptances_admin_select ON public.booking_policy_acceptances
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY payments_self_select ON public.payments
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = "bookingId" AND b."profileId" = auth.uid()
    )
  );

CREATE POLICY payments_self_insert ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = "bookingId" AND b."profileId" = auth.uid()
    )
    AND status IN ('NONE', 'PROOF_SUBMITTED')
  );

CREATE POLICY payments_self_update ON public.payments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = "bookingId" AND b."profileId" = auth.uid()
    )
  )
  WITH CHECK (status IN ('NONE', 'PROOF_SUBMITTED'));

CREATE POLICY payments_admin_all ON public.payments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY refunds_admin_all ON public.refunds
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY waitlist_self_select ON public.waitlist_entries
  FOR SELECT TO authenticated
  USING ("profileId" = auth.uid() OR public.is_admin());

CREATE POLICY waitlist_self_insert ON public.waitlist_entries
  FOR INSERT TO authenticated
  WITH CHECK ("profileId" = auth.uid() AND status = 'WAITING');

CREATE POLICY waitlist_admin_all ON public.waitlist_entries
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY cancellation_self_select ON public.cancellation_requests
  FOR SELECT TO authenticated
  USING ("requesterId" = auth.uid() OR public.is_admin());

CREATE POLICY cancellation_self_insert ON public.cancellation_requests
  FOR INSERT TO authenticated
  WITH CHECK ("requesterId" = auth.uid() AND resolution = 'OPEN');

CREATE POLICY cancellation_admin_all ON public.cancellation_requests
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY reschedule_self_select ON public.reschedule_requests
  FOR SELECT TO authenticated
  USING ("requesterId" = auth.uid() OR public.is_admin());

CREATE POLICY reschedule_self_insert ON public.reschedule_requests
  FOR INSERT TO authenticated
  WITH CHECK ("requesterId" = auth.uid() AND resolution = 'OPEN');

CREATE POLICY reschedule_admin_all ON public.reschedule_requests
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY audit_admin_select ON public.audit_events
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY audit_insert_authenticated ON public.audit_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Customers cannot confirm or check themselves in via direct writes.
-- CONFIRMED / CHECKED_IN / refund statuses are omitted from customer WITH CHECK.

-- ---------------------------------------------------------------------------
-- Function execute grants
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.session_consumed_capacity(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_reservation(uuid, text, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.transition_booking(text, booking_status, audit_actor_type, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_holds_and_promote_waitlist() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.evaluate_waitlist_promotion(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_in_booking(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_no_show(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.session_consumed_capacity(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_reservation(uuid, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_cancellation_request(text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_reschedule_request(text, uuid, text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- BE-021 storage object policies
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects missing — skip BE-021 policies (plain Postgres).';
    RETURN;
  END IF;

  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS payment_proofs_customer_select ON storage.objects;
  DROP POLICY IF EXISTS payment_proofs_customer_insert ON storage.objects;
  DROP POLICY IF EXISTS payment_proofs_customer_update ON storage.objects;
  DROP POLICY IF EXISTS payment_proofs_admin_all ON storage.objects;
  DROP POLICY IF EXISTS coach_photos_public_read ON storage.objects;
  DROP POLICY IF EXISTS coach_photos_admin_write ON storage.objects;
  DROP POLICY IF EXISTS marketing_assets_public_read ON storage.objects;
  DROP POLICY IF EXISTS marketing_assets_admin_write ON storage.objects;

  CREATE POLICY payment_proofs_customer_select ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'payment-proofs'
      AND (
        public.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = (storage.foldername(name))[1]
            AND b."profileId" = auth.uid()
        )
      )
    );

  CREATE POLICY payment_proofs_customer_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'payment-proofs'
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = (storage.foldername(name))[1]
          AND b."profileId" = auth.uid()
      )
    );

  CREATE POLICY payment_proofs_customer_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'payment-proofs'
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = (storage.foldername(name))[1]
          AND b."profileId" = auth.uid()
      )
    )
    WITH CHECK (
      bucket_id = 'payment-proofs'
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = (storage.foldername(name))[1]
          AND b."profileId" = auth.uid()
      )
    );

  CREATE POLICY payment_proofs_admin_all ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'payment-proofs' AND public.is_admin())
    WITH CHECK (bucket_id = 'payment-proofs' AND public.is_admin());

  CREATE POLICY coach_photos_public_read ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'coach-photos');

  CREATE POLICY coach_photos_admin_write ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'coach-photos' AND public.is_admin())
    WITH CHECK (bucket_id = 'coach-photos' AND public.is_admin());

  CREATE POLICY marketing_assets_public_read ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'marketing-assets');

  CREATE POLICY marketing_assets_admin_write ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'marketing-assets' AND public.is_admin())
    WITH CHECK (bucket_id = 'marketing-assets' AND public.is_admin());
END $$;

-- ---------------------------------------------------------------------------
-- BE-022 reporting (date range: startsAt >= from AND startsAt < to)
-- ---------------------------------------------------------------------------
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
IMMUTABLE
AS $$
  SELECT p_session."startsAt" >= p_from
     AND p_session."startsAt" < p_to
     AND (p_class_id IS NULL OR p_session."classId" = p_class_id)
     AND (p_coach_id IS NULL OR p_session."coachId" = p_coach_id)
     AND (p_session_status IS NULL OR p_session.status = p_session_status);
$$;

CREATE OR REPLACE FUNCTION public.report_sales_overview(
  p_from timestamptz,
  p_to timestamptz,
  p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL,
  p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "grossSales" numeric,
  "refunds" numeric,
  "netSales" numeric,
  "paidBookings" integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scoped AS (
    SELECT s.id, s."customerPrice"
    FROM sessions s
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  ),
  paid AS (
    SELECT b.id, s."customerPrice"
    FROM bookings b
    JOIN scoped s ON s.id = b."sessionId"
    WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
  )
  SELECT
    COALESCE((SELECT SUM("customerPrice") FROM paid), 0),
    COALESCE((
      SELECT SUM(r.amount) FROM refunds r
      JOIN bookings b ON b.id = r."bookingId"
      JOIN scoped s ON s.id = b."sessionId"
      WHERE r.status = 'REFUNDED'
    ), 0),
    COALESCE((SELECT SUM("customerPrice") FROM paid), 0) - COALESCE((
      SELECT SUM(r.amount) FROM refunds r
      JOIN bookings b ON b.id = r."bookingId"
      JOIN scoped s ON s.id = b."sessionId"
      WHERE r.status = 'REFUNDED'
    ), 0),
    COALESCE((SELECT COUNT(*)::integer FROM paid), 0);
$$;

CREATE OR REPLACE FUNCTION public.report_class_performance(
  p_from timestamptz,
  p_to timestamptz,
  p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL,
  p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "className" text,
  sessions integer,
  revenue numeric,
  occupancy numeric,
  "noShows" integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.name,
    COUNT(DISTINCT s.id)::integer,
    COALESCE(SUM(CASE WHEN b.status IN ('CONFIRMED', 'CHECKED_IN') THEN s."customerPrice" ELSE 0 END), 0),
    CASE WHEN SUM(s.capacity) = 0 THEN 0
         ELSE SUM(CASE WHEN b.status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED') THEN 1 ELSE 0 END)::numeric
              / NULLIF(SUM(DISTINCT s.capacity), 0)
    END,
    SUM(CASE WHEN b.status = 'NO_SHOW' THEN 1 ELSE 0 END)::integer
  FROM sessions s
  JOIN classes c ON c.id = s."classId"
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  GROUP BY c.name;
$$;

-- Occupancy aggregation above can double-count capacity; provide a cleaner version.
CREATE OR REPLACE FUNCTION public.report_class_performance_v2(
  p_from timestamptz,
  p_to timestamptz,
  p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL,
  p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "className" text,
  sessions integer,
  revenue numeric,
  occupancy numeric,
  "noShows" integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scoped AS (
    SELECT s.*
    FROM sessions s
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  ),
  per_session AS (
    SELECT
      s.id,
      s."classId",
      s.capacity,
      s."customerPrice",
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
    COALESCE(SUM(ps.paid * ps."customerPrice"), 0),
    CASE WHEN SUM(ps.capacity) = 0 THEN 0
         ELSE SUM(ps.confirmed)::numeric / SUM(ps.capacity) END,
    SUM(ps.no_shows)::integer
  FROM per_session ps
  JOIN classes c ON c.id = ps."classId"
  GROUP BY c.name;
$$;

CREATE OR REPLACE FUNCTION public.report_coach_costs(
  p_from timestamptz,
  p_to timestamptz,
  p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL,
  p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "coachName" text,
  sessions integer,
  "coachCost" numeric,
  "relatedRevenue" numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scoped AS (
    SELECT s.*
    FROM sessions s
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
      AND s."coachId" IS NOT NULL
  ),
  per_session AS (
    SELECT
      s.id,
      s."coachId",
      s."coachRate" AS coach_cost,
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice" AS revenue
    FROM scoped s
    LEFT JOIN bookings b ON b."sessionId" = s.id
    GROUP BY s.id, s."coachId", s."coachRate", s."customerPrice"
  )
  SELECT
    co.name,
    COUNT(ps.id)::integer,
    SUM(ps.coach_cost),
    COALESCE(SUM(ps.revenue), 0)
  FROM per_session ps
  JOIN coaches co ON co.id = ps."coachId"
  GROUP BY co.name;
$$;

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
    s."coachRate"
  FROM sessions s
  JOIN classes c ON c.id = s."classId"
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  GROUP BY s.id, s."startsAt", c.name, s.capacity, s."customerPrice", s."coachRate";
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
    s."coachRate",
    (COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice") - s."coachRate",
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

REVOKE ALL ON FUNCTION public.report_sales_overview(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_class_performance_v2(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_coach_costs(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_session_performance(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_session_drilldown(text) FROM PUBLIC;

COMMENT ON FUNCTION public.report_sales_overview IS
  'BE-022 sales overview. Date window is half-open: startsAt >= p_from AND startsAt < p_to. No field named profit.';
COMMENT ON FUNCTION public.report_class_performance_v2 IS
  'BE-022 class performance. Occupancy = confirmed/capacity; use report_session_drilldown for attendance utilisation.';
COMMENT ON FUNCTION public.report_coach_costs IS
  'BE-022 coach report. Coach cost uses session snapshot, never coaches.defaultRate.';

CREATE OR REPLACE VIEW public.session_roster_metrics
WITH (security_invoker = true) AS
SELECT
  s.id AS "sessionId",
  s.capacity,
  app_private.session_consumed_capacity(s.id) AS consumed,
  GREATEST(s.capacity - app_private.session_consumed_capacity(s.id), 0) AS available
FROM sessions s;

REVOKE ALL ON public.session_roster_metrics FROM anon, authenticated;
