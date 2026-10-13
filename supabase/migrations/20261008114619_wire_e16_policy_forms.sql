BEGIN;

DO $$ BEGIN
  CREATE TYPE public.customer_policy_form AS ENUM (
    'sign_up', 'booking', 'package_request', 'payment_proof', 'reschedule', 'cancellation', 'contact'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.policy_form_requirements (
  form public.customer_policy_form NOT NULL,
  "documentId" TEXT NOT NULL REFERENCES public.policy_documents(id) ON DELETE RESTRICT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (form, "documentId")
);
CREATE INDEX IF NOT EXISTS policy_form_requirements_form_sort_idx
  ON public.policy_form_requirements (form, "sortOrder");

ALTER TABLE public.policy_form_requirements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.policy_form_requirements FROM anon, authenticated;
GRANT SELECT ON TABLE public.policy_form_requirements TO anon, authenticated;
DROP POLICY IF EXISTS policy_form_requirements_public_read ON public.policy_form_requirements;
CREATE POLICY policy_form_requirements_public_read ON public.policy_form_requirements
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS policy_form_requirements_admin_write ON public.policy_form_requirements;
CREATE POLICY policy_form_requirements_admin_write ON public.policy_form_requirements
  FOR ALL TO authenticated
  USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

ALTER TABLE public.booking_policy_acceptances
  ALTER COLUMN "bookingId" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS form public.customer_policy_form NOT NULL DEFAULT 'booking',
  ADD COLUMN IF NOT EXISTS "acquisitionId" TEXT;
CREATE INDEX IF NOT EXISTS booking_policy_acceptances_form_profile_accepted_idx
  ON public.booking_policy_acceptances (form, "profileId", "acceptedAt");
CREATE INDEX IF NOT EXISTS booking_policy_acceptances_acquisition_idx
  ON public.booking_policy_acceptances ("acquisitionId");

CREATE OR REPLACE FUNCTION app_private.assert_required_acceptances(p_booking_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM policy_form_requirements r
    JOIN policy_document_versions v ON v."documentId" = r."documentId" AND v."isCurrent" = true
    WHERE r.form = 'booking'
      AND NOT EXISTS (
        SELECT 1 FROM booking_policy_acceptances a
        WHERE a."bookingId" = p_booking_id
          AND a.form = 'booking'
          AND a."policyVersionId" = v.id
      )
  ) THEN
    RAISE EXCEPTION 'missing_required_policy_acceptance' USING ERRCODE = 'P0001';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION app_private.assert_required_acceptances(text) FROM PUBLIC;

NOTIFY pgrst, 'reload schema';
COMMIT;
