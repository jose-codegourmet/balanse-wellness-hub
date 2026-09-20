-- BE-050…BE-054: queue keyset indexes, session invariants, FAQs, pending uploads,
-- one-current policy version, orphan-upload reaper, transactional capacity update.

-- ---------------------------------------------------------------------------
-- BE-050 — composite indexes matching documented ORDER BY tuples
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "bookings_reservedAt_id_idx" ON public.bookings ("reservedAt", id);
CREATE INDEX IF NOT EXISTS "bookings_holdExpiresAt_id_idx" ON public.bookings ("holdExpiresAt", id);
CREATE INDEX IF NOT EXISTS "payments_method_status_createdAt_idx"
  ON public.payments (method, status, "createdAt");
CREATE INDEX IF NOT EXISTS "refunds_status_createdAt_id_idx"
  ON public.refunds (status, "createdAt", id);
CREATE INDEX IF NOT EXISTS "cancellation_requests_resolution_requestedAt_id_idx"
  ON public.cancellation_requests (resolution, "requestedAt", id);
CREATE INDEX IF NOT EXISTS "reschedule_requests_resolution_requestedAt_id_idx"
  ON public.reschedule_requests (resolution, "requestedAt", id);
CREATE INDEX IF NOT EXISTS "coaches_photoKey_idx" ON public.coaches ("photoKey");

-- ---------------------------------------------------------------------------
-- BE-051 — session time + capacity invariants
-- ---------------------------------------------------------------------------
ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_ends_after_starts;
ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_ends_after_starts CHECK ("endsAt" > "startsAt");

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_capacity_positive;
ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_capacity_positive CHECK (capacity >= 1);

CREATE OR REPLACE FUNCTION public.update_session_capacity(p_session_id text, p_capacity integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consumed integer;
BEGIN
  IF p_capacity < 1 THEN
    RAISE EXCEPTION 'validation_failed:out_of_range'
      USING ERRCODE = 'P0001';
  END IF;

  PERFORM 1 FROM public.sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found'
      USING ERRCODE = 'P0001';
  END IF;

  v_consumed := app_private.session_consumed_capacity(p_session_id);
  IF p_capacity < v_consumed THEN
    RAISE EXCEPTION 'below_confirmed_count'
      USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.sessions
    SET capacity = p_capacity, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_session_id;

  RETURN v_consumed;
END;
$$;

REVOKE ALL ON FUNCTION public.update_session_capacity(text, integer) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- BE-053 — FAQ table + one current policy version
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "faqs_sortOrder_idx" ON public.faqs ("sortOrder");

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS faqs_public_read ON public.faqs;
CREATE POLICY faqs_public_read ON public.faqs
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS faqs_admin_write ON public.faqs;
CREATE POLICY faqs_admin_write ON public.faqs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS policy_document_versions_one_current
  ON public.policy_document_versions ("documentId")
  WHERE "isCurrent" = true;

-- ---------------------------------------------------------------------------
-- BE-052 — pending signed uploads + reaper
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_uploads (
  id TEXT NOT NULL,
  bucket TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  purpose TEXT NOT NULL,
  "entityId" TEXT,
  "actorId" TEXT,
  "confirmedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT pending_uploads_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "pending_uploads_objectKey_key"
  ON public.pending_uploads ("objectKey");
CREATE INDEX IF NOT EXISTS "pending_uploads_confirmedAt_createdAt_idx"
  ON public.pending_uploads ("confirmedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "pending_uploads_actorId_idx"
  ON public.pending_uploads ("actorId");

ALTER TABLE public.pending_uploads
  DROP CONSTRAINT IF EXISTS pending_uploads_actorId_fkey;
ALTER TABLE public.pending_uploads
  ADD CONSTRAINT pending_uploads_actorId_fkey
  FOREIGN KEY ("actorId") REFERENCES public.staff_members(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.pending_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pending_uploads_admin_all ON public.pending_uploads;
CREATE POLICY pending_uploads_admin_all ON public.pending_uploads
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.reap_pending_uploads()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.pending_uploads
  WHERE "confirmedAt" IS NULL
    AND "createdAt" < CURRENT_TIMESTAMP - INTERVAL '24 hours';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('reaped', v_count);
END;
$$;

REVOKE ALL ON FUNCTION public.reap_pending_uploads() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'balanse-reap-pending-uploads';
    PERFORM cron.schedule(
      'balanse-reap-pending-uploads',
      '15 * * * *',
      $cron$SELECT public.reap_pending_uploads()$cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not scheduled for pending uploads: %', SQLERRM;
END $$;
