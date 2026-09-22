-- BE-058 session bundles (customer-facing: packages).
-- Additive. Do not apply to the shared project until reviewed; Prisma is source of truth.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE "bundle_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "bundle_applicability_mode" AS ENUM ('ALL_ACTIVE_CLASSES', 'EXPLICIT_CLASSES');
CREATE TYPE "bundle_acquisition_kind" AS ENUM ('CUSTOMER_CLAIM', 'CUSTOMER_PAID', 'ADMIN_GRANT');
CREATE TYPE "bundle_acquisition_status" AS ENUM (
  'PENDING_PAYMENT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'
);
CREATE TYPE "customer_bundle_status" AS ENUM ('ACTIVE', 'EXHAUSTED', 'EXPIRED', 'REVOKED');
CREATE TYPE "bundle_redemption_status" AS ENUM ('HELD', 'CONSUMED', 'RESTORED');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE "bundles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "sessionCreditCount" INTEGER NOT NULL,
  "pricePhp" DECIMAL(12,2) NOT NULL,
  "applicabilityMode" "bundle_applicability_mode" NOT NULL,
  "validityDays" INTEGER,
  "perCustomerLimit" INTEGER,
  "status" "bundle_status" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bundles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bundles_credits_positive" CHECK ("sessionCreditCount" > 0),
  CONSTRAINT "bundles_price_nonnegative" CHECK ("pricePhp" >= 0),
  CONSTRAINT "bundles_validity_positive" CHECK ("validityDays" IS NULL OR "validityDays" > 0),
  CONSTRAINT "bundles_limit_positive" CHECK ("perCustomerLimit" IS NULL OR "perCustomerLimit" > 0)
);

CREATE UNIQUE INDEX "bundles_slug_key" ON "bundles"("slug");
CREATE INDEX "bundles_status_idx" ON "bundles"("status");

CREATE TABLE "bundle_class_applicability" (
  "id" TEXT NOT NULL,
  "bundleId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bundle_class_applicability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bundle_class_applicability_bundleId_classId_key"
  ON "bundle_class_applicability"("bundleId", "classId");
CREATE INDEX "bundle_class_applicability_classId_idx" ON "bundle_class_applicability"("classId");

CREATE TABLE "bundle_acquisitions" (
  "id" TEXT NOT NULL,
  "bundleId" TEXT NOT NULL,
  "profileId" UUID NOT NULL,
  "kind" "bundle_acquisition_kind" NOT NULL,
  "status" "bundle_acquisition_status" NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "overrideLimit" BOOLEAN NOT NULL DEFAULT false,
  "overrideReason" TEXT,
  "adminNote" TEXT,
  "grantedById" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMPTZ,
  "rejectionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bundle_acquisitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bundle_acquisitions_idempotencyKey_key" ON "bundle_acquisitions"("idempotencyKey");
CREATE INDEX "bundle_acquisitions_profileId_status_idx" ON "bundle_acquisitions"("profileId", "status");
CREATE INDEX "bundle_acquisitions_bundleId_profileId_idx" ON "bundle_acquisitions"("bundleId", "profileId");
CREATE INDEX "bundle_acquisitions_status_createdAt_idx" ON "bundle_acquisitions"("status", "createdAt");

CREATE TABLE "bundle_acquisition_payments" (
  "id" TEXT NOT NULL,
  "acquisitionId" TEXT NOT NULL,
  "method" "payment_method" NOT NULL,
  "status" "payment_status" NOT NULL DEFAULT 'NONE',
  "amount" DECIMAL(12,2) NOT NULL,
  "proofObjectKey" TEXT,
  "submittedAt" TIMESTAMPTZ,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMPTZ,
  "adminNote" TEXT,
  "referenceNumber" TEXT,
  "payerName" TEXT,
  "paymentQrCodeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bundle_acquisition_payments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bundle_acquisition_payments_amount_nonnegative" CHECK ("amount" >= 0)
);

CREATE UNIQUE INDEX "bundle_acquisition_payments_acquisitionId_key"
  ON "bundle_acquisition_payments"("acquisitionId");
CREATE INDEX "bundle_acquisition_payments_status_createdAt_idx"
  ON "bundle_acquisition_payments"("status", "createdAt");
CREATE INDEX "bundle_acquisition_payments_paymentQrCodeId_idx"
  ON "bundle_acquisition_payments"("paymentQrCodeId");

CREATE TABLE "customer_bundles" (
  "id" TEXT NOT NULL,
  "acquisitionId" TEXT NOT NULL,
  "bundleId" TEXT NOT NULL,
  "profileId" UUID NOT NULL,
  "status" "customer_bundle_status" NOT NULL DEFAULT 'ACTIVE',
  "snapshotName" TEXT NOT NULL,
  "snapshotSessionCreditCount" INTEGER NOT NULL,
  "snapshotPricePhp" DECIMAL(12,2) NOT NULL,
  "snapshotApplicabilityMode" "bundle_applicability_mode" NOT NULL,
  "snapshotClassIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "snapshotValidityDays" INTEGER,
  "snapshotExpiresAt" TIMESTAMPTZ,
  "revokedAt" TIMESTAMPTZ,
  "revokedById" TEXT,
  "revokeReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "customer_bundles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_bundles_credits_positive" CHECK ("snapshotSessionCreditCount" > 0)
);

CREATE UNIQUE INDEX "customer_bundles_acquisitionId_key" ON "customer_bundles"("acquisitionId");
CREATE INDEX "customer_bundles_profileId_status_idx" ON "customer_bundles"("profileId", "status");
CREATE INDEX "customer_bundles_bundleId_idx" ON "customer_bundles"("bundleId");
CREATE INDEX "customer_bundles_snapshotExpiresAt_idx" ON "customer_bundles"("snapshotExpiresAt");

CREATE TABLE "bundle_redemptions" (
  "id" TEXT NOT NULL,
  "entitlementId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "status" "bundle_redemption_status" NOT NULL,
  "heldAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consumedAt" TIMESTAMPTZ,
  "restoredAt" TIMESTAMPTZ,
  "restoreReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bundle_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bundle_redemptions_entitlementId_status_idx"
  ON "bundle_redemptions"("entitlementId", "status");
CREATE INDEX "bundle_redemptions_bookingId_idx" ON "bundle_redemptions"("bookingId");
CREATE INDEX "bundle_redemptions_sessionId_idx" ON "bundle_redemptions"("sessionId");
CREATE UNIQUE INDEX "bundle_redemptions_one_active_per_booking"
  ON "bundle_redemptions"("bookingId")
  WHERE status <> 'RESTORED';

ALTER TABLE "waitlist_entries"
  ADD COLUMN "intendedEntitlementId" TEXT,
  ADD COLUMN "promotionBlockReason" TEXT,
  ADD COLUMN "promotionBlockedAt" TIMESTAMPTZ;

CREATE INDEX "waitlist_entries_intendedEntitlementId_idx"
  ON "waitlist_entries"("intendedEntitlementId");

-- ---------------------------------------------------------------------------
-- Foreign keys
-- ---------------------------------------------------------------------------
ALTER TABLE "bundle_class_applicability"
  ADD CONSTRAINT "bundle_class_applicability_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bundle_class_applicability"
  ADD CONSTRAINT "bundle_class_applicability_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "classes"("id") ON UPDATE CASCADE;

ALTER TABLE "bundle_acquisitions"
  ADD CONSTRAINT "bundle_acquisitions_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_acquisitions"
  ADD CONSTRAINT "bundle_acquisitions_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_acquisitions"
  ADD CONSTRAINT "bundle_acquisitions_grantedById_fkey"
  FOREIGN KEY ("grantedById") REFERENCES "staff_members"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_acquisitions"
  ADD CONSTRAINT "bundle_acquisitions_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "staff_members"("id") ON UPDATE CASCADE;

ALTER TABLE "bundle_acquisition_payments"
  ADD CONSTRAINT "bundle_acquisition_payments_acquisitionId_fkey"
  FOREIGN KEY ("acquisitionId") REFERENCES "bundle_acquisitions"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_acquisition_payments"
  ADD CONSTRAINT "bundle_acquisition_payments_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "staff_members"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_acquisition_payments"
  ADD CONSTRAINT "bundle_acquisition_payments_paymentQrCodeId_fkey"
  FOREIGN KEY ("paymentQrCodeId") REFERENCES "payment_qr_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_bundles"
  ADD CONSTRAINT "customer_bundles_acquisitionId_fkey"
  FOREIGN KEY ("acquisitionId") REFERENCES "bundle_acquisitions"("id") ON UPDATE CASCADE;
ALTER TABLE "customer_bundles"
  ADD CONSTRAINT "customer_bundles_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "bundles"("id") ON UPDATE CASCADE;
ALTER TABLE "customer_bundles"
  ADD CONSTRAINT "customer_bundles_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON UPDATE CASCADE;
ALTER TABLE "customer_bundles"
  ADD CONSTRAINT "customer_bundles_revokedById_fkey"
  FOREIGN KEY ("revokedById") REFERENCES "staff_members"("id") ON UPDATE CASCADE;

ALTER TABLE "bundle_redemptions"
  ADD CONSTRAINT "bundle_redemptions_entitlementId_fkey"
  FOREIGN KEY ("entitlementId") REFERENCES "customer_bundles"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_redemptions"
  ADD CONSTRAINT "bundle_redemptions_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON UPDATE CASCADE;
ALTER TABLE "bundle_redemptions"
  ADD CONSTRAINT "bundle_redemptions_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON UPDATE CASCADE;

ALTER TABLE "waitlist_entries"
  ADD CONSTRAINT "waitlist_entries_intendedEntitlementId_fkey"
  FOREIGN KEY ("intendedEntitlementId") REFERENCES "customer_bundles"("id") ON UPDATE CASCADE;

-- Snapshots must never be rewritten after insert.
CREATE OR REPLACE FUNCTION app_private.forbid_customer_bundle_snapshot_rewrite()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW."snapshotName" IS DISTINCT FROM OLD."snapshotName"
      OR NEW."snapshotSessionCreditCount" IS DISTINCT FROM OLD."snapshotSessionCreditCount"
      OR NEW."snapshotPricePhp" IS DISTINCT FROM OLD."snapshotPricePhp"
      OR NEW."snapshotApplicabilityMode" IS DISTINCT FROM OLD."snapshotApplicabilityMode"
      OR NEW."snapshotClassIds" IS DISTINCT FROM OLD."snapshotClassIds"
      OR NEW."snapshotValidityDays" IS DISTINCT FROM OLD."snapshotValidityDays"
      OR NEW."snapshotExpiresAt" IS DISTINCT FROM OLD."snapshotExpiresAt"
      OR NEW."acquisitionId" IS DISTINCT FROM OLD."acquisitionId"
      OR NEW."bundleId" IS DISTINCT FROM OLD."bundleId"
      OR NEW."profileId" IS DISTINCT FROM OLD."profileId"
    THEN
      RAISE EXCEPTION 'entitlement_snapshot_immutable' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER customer_bundles_snapshot_immutable
  BEFORE UPDATE ON public.customer_bundles
  FOR EACH ROW
  EXECUTE FUNCTION app_private.forbid_customer_bundle_snapshot_rewrite();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_class_applicability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_acquisition_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_redemptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.bundles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.bundle_class_applicability FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.bundle_acquisitions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.bundle_acquisition_payments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.customer_bundles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.bundle_redemptions FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.bundles TO anon, authenticated;
GRANT SELECT ON public.bundle_class_applicability TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bundle_acquisitions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bundle_acquisition_payments TO authenticated;
GRANT SELECT ON public.customer_bundles TO authenticated;
GRANT SELECT ON public.bundle_redemptions TO authenticated;

CREATE POLICY bundles_public_read ON public.bundles
  FOR SELECT TO anon, authenticated
  USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY bundles_admin_write ON public.bundles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY bundle_class_public_read ON public.bundle_class_applicability
  FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bundles b
      WHERE b.id = "bundleId" AND b.status = 'PUBLISHED'
    )
  );

CREATE POLICY bundle_class_admin_write ON public.bundle_class_applicability
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY bundle_acquisitions_own ON public.bundle_acquisitions
  FOR SELECT TO authenticated
  USING ("profileId" = auth.uid() OR public.is_admin());

CREATE POLICY bundle_acquisitions_own_insert ON public.bundle_acquisitions
  FOR INSERT TO authenticated
  WITH CHECK (("profileId" = auth.uid() AND NOT public.is_admin()) OR public.is_admin());

CREATE POLICY bundle_acquisitions_own_update ON public.bundle_acquisitions
  FOR UPDATE TO authenticated
  USING ("profileId" = auth.uid() OR public.is_admin())
  WITH CHECK ("profileId" = auth.uid() OR public.is_admin());

CREATE POLICY bundle_payments_own ON public.bundle_acquisition_payments
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bundle_acquisitions a
      WHERE a.id = "acquisitionId" AND a."profileId" = auth.uid()
    )
  );

CREATE POLICY bundle_payments_own_write ON public.bundle_acquisition_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bundle_acquisitions a
      WHERE a.id = "acquisitionId" AND a."profileId" = auth.uid()
    )
  );

CREATE POLICY bundle_payments_own_update ON public.bundle_acquisition_payments
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bundle_acquisitions a
      WHERE a.id = "acquisitionId" AND a."profileId" = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bundle_acquisitions a
      WHERE a.id = "acquisitionId" AND a."profileId" = auth.uid()
    )
  );

CREATE POLICY customer_bundles_own ON public.customer_bundles
  FOR SELECT TO authenticated
  USING ("profileId" = auth.uid() OR public.is_admin());

CREATE POLICY customer_bundles_admin_write ON public.customer_bundles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY bundle_redemptions_own ON public.bundle_redemptions
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.customer_bundles e
      WHERE e.id = "entitlementId" AND e."profileId" = auth.uid()
    )
  );

CREATE POLICY bundle_redemptions_admin_write ON public.bundle_redemptions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Ledger helpers (transactional hold / consume / restore)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.bundle_committed_credits(p_entitlement_id text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::int
  FROM public.bundle_redemptions
  WHERE "entitlementId" = p_entitlement_id
    AND status IN ('HELD', 'CONSUMED');
$$;

CREATE OR REPLACE FUNCTION app_private.refresh_customer_bundle_status(p_entitlement_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_row public.customer_bundles%ROWTYPE;
  v_used int;
BEGIN
  SELECT * INTO v_row FROM public.customer_bundles WHERE id = p_entitlement_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  IF v_row.status = 'REVOKED' THEN
    RETURN;
  END IF;
  IF v_row."snapshotExpiresAt" IS NOT NULL AND v_row."snapshotExpiresAt" <= clock_timestamp() THEN
    UPDATE public.customer_bundles
      SET status = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = p_entitlement_id AND status <> 'EXPIRED';
    RETURN;
  END IF;
  v_used := app_private.bundle_committed_credits(p_entitlement_id);
  IF v_used >= v_row."snapshotSessionCreditCount" THEN
    UPDATE public.customer_bundles
      SET status = 'EXHAUSTED', "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = p_entitlement_id AND status <> 'EXHAUSTED';
  ELSIF v_row.status = 'EXHAUSTED' THEN
    UPDATE public.customer_bundles
      SET status = 'ACTIVE', "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = p_entitlement_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.assert_entitlement_usable(
  p_entitlement_id text,
  p_profile_id uuid,
  p_session_id text
)
RETURNS public.customer_bundles
LANGUAGE plpgsql
AS $$
DECLARE
  v_ent public.customer_bundles%ROWTYPE;
  v_session public.sessions%ROWTYPE;
  v_used int;
BEGIN
  SELECT * INTO v_ent FROM public.customer_bundles WHERE id = p_entitlement_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'entitlement_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_ent."profileId" <> p_profile_id THEN
    RAISE EXCEPTION 'entitlement_foreign' USING ERRCODE = 'P0001';
  END IF;
  IF v_ent.status = 'REVOKED' THEN
    RAISE EXCEPTION 'entitlement_revoked' USING ERRCODE = 'P0001';
  END IF;
  PERFORM app_private.refresh_customer_bundle_status(p_entitlement_id);
  SELECT * INTO v_ent FROM public.customer_bundles WHERE id = p_entitlement_id;
  IF v_ent.status = 'EXPIRED' THEN
    RAISE EXCEPTION 'entitlement_expired' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_session FROM public.sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_ent."snapshotExpiresAt" IS NOT NULL AND v_session."startsAt" >= v_ent."snapshotExpiresAt" THEN
    RAISE EXCEPTION 'entitlement_expired' USING ERRCODE = 'P0001';
  END IF;
  IF v_ent."snapshotApplicabilityMode" = 'EXPLICIT_CLASSES'
    AND NOT (v_session."classId" = ANY (v_ent."snapshotClassIds"))
  THEN
    RAISE EXCEPTION 'entitlement_ineligible_class' USING ERRCODE = 'P0001';
  END IF;
  v_used := app_private.bundle_committed_credits(p_entitlement_id);
  IF v_used >= v_ent."snapshotSessionCreditCount" THEN
    RAISE EXCEPTION 'entitlement_exhausted' USING ERRCODE = 'P0001';
  END IF;
  RETURN v_ent;
END;
$$;

CREATE OR REPLACE FUNCTION public.hold_bundle_redemption(
  p_entitlement_id text,
  p_booking_id text,
  p_session_id text,
  p_profile_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id text;
  v_existing text;
BEGIN
  PERFORM app_private.assert_entitlement_usable(p_entitlement_id, p_profile_id, p_session_id);

  SELECT id INTO v_existing
  FROM public.bundle_redemptions
  WHERE "bookingId" = p_booking_id AND status <> 'RESTORED'
  FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION 'redemption_conflict' USING ERRCODE = 'P0001';
  END IF;

  v_id := app_private.new_id();
  INSERT INTO public.bundle_redemptions (
    id, "entitlementId", "bookingId", "sessionId", status, "heldAt",
    "createdAt", "updatedAt"
  ) VALUES (
    v_id, p_entitlement_id, p_booking_id, p_session_id, 'HELD', clock_timestamp(),
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );

  PERFORM app_private.refresh_customer_bundle_status(p_entitlement_id);
  PERFORM app_private.write_audit(
    'customer_bundle', p_entitlement_id, 'bundle.hold', 'SYSTEM', NULL,
    NULL, 'HELD',
    jsonb_build_object('bookingId', p_booking_id, 'sessionId', p_session_id, 'redemptionId', v_id)
  );
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_bundle_redemption(p_booking_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.bundle_redemptions%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.bundle_redemptions
  WHERE "bookingId" = p_booking_id AND status <> 'RESTORED'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  IF v_row.status = 'CONSUMED' THEN
    RETURN;
  END IF;
  UPDATE public.bundle_redemptions
    SET status = 'CONSUMED',
        "consumedAt" = clock_timestamp(),
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_row.id;
  PERFORM app_private.refresh_customer_bundle_status(v_row."entitlementId");
  PERFORM app_private.write_audit(
    'customer_bundle', v_row."entitlementId", 'bundle.consume', 'SYSTEM', NULL,
    'HELD', 'CONSUMED',
    jsonb_build_object('bookingId', p_booking_id, 'redemptionId', v_row.id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_bundle_redemption(
  p_booking_id text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.bundle_redemptions%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.bundle_redemptions
  WHERE "bookingId" = p_booking_id AND status <> 'RESTORED'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  UPDATE public.bundle_redemptions
    SET status = 'RESTORED',
        "restoredAt" = clock_timestamp(),
        "restoreReason" = p_reason,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_row.id;
  PERFORM app_private.refresh_customer_bundle_status(v_row."entitlementId");
  PERFORM app_private.write_audit(
    'customer_bundle', v_row."entitlementId", 'bundle.restore', 'SYSTEM', NULL,
    v_row.status::text, 'RESTORED',
    jsonb_build_object('bookingId', p_booking_id, 'redemptionId', v_row.id, 'reason', p_reason)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.move_bundle_redemption(
  p_booking_id text,
  p_target_session_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.bundle_redemptions%ROWTYPE;
  v_booking public.bookings%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.bundle_redemptions
  WHERE "bookingId" = p_booking_id AND status <> 'RESTORED'
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  PERFORM app_private.assert_entitlement_usable(
    v_row."entitlementId", v_booking."profileId", p_target_session_id
  );
  UPDATE public.bundle_redemptions
    SET "sessionId" = p_target_session_id,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_row.id;
  PERFORM app_private.write_audit(
    'customer_bundle', v_row."entitlementId", 'bundle.reschedule', 'SYSTEM', NULL,
    NULL, v_row.status::text,
    jsonb_build_object(
      'bookingId', p_booking_id,
      'fromSessionId', v_row."sessionId",
      'toSessionId', p_target_session_id,
      'redemptionId', v_row.id
    )
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Existing reservation functions: optional entitlement args + restore hooks
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_reservation(uuid, text, text[]);

CREATE FUNCTION public.create_reservation(
  p_profile_id uuid,
  p_session_id text,
  p_acceptance_version_ids text[],
  p_entitlement_id text DEFAULT NULL,
  p_intended_entitlement_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session sessions%ROWTYPE;
  v_booking_id text;
  v_waitlist_id text;
  v_hold timestamptz;
  v_seq bigint;
  v_version text;
  v_consumed int;
  v_intent text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_session_id, 0));

  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_session.status <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'session_not_reservable' USING ERRCODE = 'P0001';
  END IF;
  IF app_private.session_is_past_cutoff(p_session_id) THEN
    RAISE EXCEPTION 'booking_cutoff_reached' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE "profileId" = p_profile_id
      AND "sessionId" = p_session_id
      AND status IN (
        'HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED',
        'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN', 'WAITLISTED'
      )
  ) THEN
    RAISE EXCEPTION 'duplicate_active_reservation' USING ERRCODE = 'P0001';
  END IF;

  v_booking_id := app_private.new_id();
  v_hold := app_private.compute_hold_expires_at(clock_timestamp(), v_session."startsAt");
  v_consumed := app_private.session_consumed_capacity(p_session_id);
  v_intent := COALESCE(p_intended_entitlement_id, p_entitlement_id);

  IF v_consumed < v_session.capacity THEN
    INSERT INTO bookings (
      id, "profileId", "sessionId", status, "reservedAt", "holdExpiresAt",
      "bookingReference", "createdAt", "updatedAt"
    ) VALUES (
      v_booking_id, p_profile_id, p_session_id, 'HELD_AWAITING_PAYMENT',
      clock_timestamp(), v_hold, app_private.opaque_reference(),
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
    IF p_entitlement_id IS NOT NULL THEN
      PERFORM public.hold_bundle_redemption(
        p_entitlement_id, v_booking_id, p_session_id, p_profile_id
      );
    END IF;
  ELSE
    SELECT COALESCE(MAX(sequence), 0) + 1 INTO v_seq
    FROM waitlist_entries WHERE "sessionId" = p_session_id;

    INSERT INTO bookings (
      id, "profileId", "sessionId", status, "reservedAt", "holdExpiresAt",
      "bookingReference", "createdAt", "updatedAt"
    ) VALUES (
      v_booking_id, p_profile_id, p_session_id, 'WAITLISTED',
      clock_timestamp(), NULL, app_private.opaque_reference(),
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    v_waitlist_id := app_private.new_id();
    INSERT INTO waitlist_entries (
      id, "sessionId", "profileId", "bookingId", "joinedAt", sequence, status,
      "intendedEntitlementId", "createdAt", "updatedAt"
    ) VALUES (
      v_waitlist_id, p_session_id, p_profile_id, v_booking_id,
      clock_timestamp(), v_seq, 'WAITING',
      v_intent, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
  END IF;

  IF p_acceptance_version_ids IS NOT NULL THEN
    FOREACH v_version IN ARRAY p_acceptance_version_ids LOOP
      INSERT INTO booking_policy_acceptances (
        id, "bookingId", "profileId", "policyVersionId", "acceptedAt",
        "createdAt", "updatedAt"
      ) VALUES (
        app_private.new_id(), v_booking_id, p_profile_id, v_version,
        clock_timestamp(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    END LOOP;
  END IF;
  PERFORM app_private.assert_required_acceptances(v_booking_id);

  PERFORM app_private.write_audit(
    'booking', v_booking_id, 'booking.create', 'CUSTOMER', NULL,
    NULL,
    CASE WHEN v_waitlist_id IS NULL THEN 'HELD_AWAITING_PAYMENT' ELSE 'WAITLISTED' END,
    jsonb_build_object(
      'sessionId', p_session_id,
      'waitlistEntryId', v_waitlist_id,
      'entitlementId', p_entitlement_id
    )
  );

  RETURN jsonb_build_object(
    'bookingId', v_booking_id,
    'kind', CASE WHEN v_waitlist_id IS NULL THEN 'hold' ELSE 'waitlist' END,
    'waitlistEntryId', v_waitlist_id,
    'holdExpiresAt', CASE WHEN v_waitlist_id IS NULL THEN v_hold ELSE NULL END
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.evaluate_waitlist_promotion(p_session_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry waitlist_entries%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_session sessions%ROWTYPE;
  v_hold timestamptz;
  v_system text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_session_id, 0));
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  IF v_session.status <> 'PUBLISHED' THEN
    RETURN NULL;
  END IF;
  IF app_private.session_is_past_cutoff(p_session_id) THEN
    RETURN NULL;
  END IF;
  IF app_private.session_consumed_capacity(p_session_id) >= v_session.capacity THEN
    RETURN NULL;
  END IF;

  LOOP
    SELECT * INTO v_entry
    FROM waitlist_entries
    WHERE "sessionId" = p_session_id
      AND status = 'WAITING'
      AND "promotionBlockReason" IS NULL
    ORDER BY sequence ASC, "joinedAt" ASC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
      RETURN NULL;
    END IF;

    IF v_entry."intendedEntitlementId" IS NOT NULL THEN
      BEGIN
        PERFORM app_private.assert_entitlement_usable(
          v_entry."intendedEntitlementId", v_entry."profileId", p_session_id
        );
      EXCEPTION WHEN OTHERS THEN
        UPDATE waitlist_entries
          SET "promotionBlockReason" = SQLERRM,
              "promotionBlockedAt" = clock_timestamp(),
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = v_entry.id;
        PERFORM app_private.write_audit(
          'waitlist_entry', v_entry.id, 'waitlist.promotion_blocked', 'SYSTEM',
          app_private.system_staff_id(),
          'WAITING', 'WAITING',
          jsonb_build_object(
            'reason', SQLERRM,
            'intendedEntitlementId', v_entry."intendedEntitlementId"
          )
        );
        CONTINUE;
      END;
    END IF;

    EXIT;
  END LOOP;

  v_system := app_private.system_staff_id();
  v_hold := app_private.compute_hold_expires_at(clock_timestamp(), v_session."startsAt");

  UPDATE waitlist_entries
    SET status = 'PROMOTED', "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_entry.id;

  IF v_entry."bookingId" IS NOT NULL THEN
    UPDATE bookings
      SET status = 'HELD_AWAITING_PAYMENT',
          "holdExpiresAt" = v_hold,
          "reservedAt" = clock_timestamp(),
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_entry."bookingId";
    IF v_entry."intendedEntitlementId" IS NOT NULL THEN
      PERFORM public.hold_bundle_redemption(
        v_entry."intendedEntitlementId", v_entry."bookingId", p_session_id, v_entry."profileId"
      );
    END IF;
    PERFORM app_private.write_audit(
      'booking', v_entry."bookingId", 'waitlist.promote', 'SYSTEM', v_system,
      'WAITLISTED', 'HELD_AWAITING_PAYMENT',
      jsonb_build_object('waitlistEntryId', v_entry.id)
    );
    PERFORM app_private.write_audit(
      'waitlist_entry', v_entry.id, 'waitlist.promote', 'SYSTEM', v_system,
      'WAITING', 'PROMOTED', jsonb_build_object('bookingId', v_entry."bookingId")
    );
    RETURN v_entry."bookingId";
  END IF;

  INSERT INTO bookings (
    id, "profileId", "sessionId", status, "reservedAt", "holdExpiresAt",
    "bookingReference", "createdAt", "updatedAt"
  ) VALUES (
    app_private.new_id(), v_entry."profileId", p_session_id, 'HELD_AWAITING_PAYMENT',
    clock_timestamp(), v_hold, app_private.opaque_reference(),
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
  RETURNING * INTO v_booking;

  UPDATE waitlist_entries
    SET "bookingId" = v_booking.id, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_entry.id;

  IF v_entry."intendedEntitlementId" IS NOT NULL THEN
    PERFORM public.hold_bundle_redemption(
      v_entry."intendedEntitlementId", v_booking.id, p_session_id, v_entry."profileId"
    );
  END IF;

  PERFORM app_private.write_audit(
    'booking', v_booking.id, 'waitlist.promote', 'SYSTEM', v_system,
    NULL, 'HELD_AWAITING_PAYMENT',
    jsonb_build_object('waitlistEntryId', v_entry.id)
  );
  RETURN v_booking.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_holds_and_promote_waitlist()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_system text;
  v_expired int := 0;
  v_promoted int := 0;
  v_session_id text;
  v_promoted_id text;
BEGIN
  v_system := app_private.system_staff_id();

  FOR v_booking IN
    SELECT id, "sessionId", status
    FROM bookings
    WHERE status = 'HELD_AWAITING_PAYMENT'
      AND "holdExpiresAt" IS NOT NULL
      AND "holdExpiresAt" <= clock_timestamp()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE bookings
      SET status = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_booking.id;
    PERFORM public.restore_bundle_redemption(v_booking.id, 'hold_expired');
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'hold.expire', 'SYSTEM', v_system,
      v_booking.status::text, 'EXPIRED', '{}'::jsonb
    );
    v_expired := v_expired + 1;
    v_promoted_id := public.evaluate_waitlist_promotion(v_booking."sessionId");
    IF v_promoted_id IS NOT NULL THEN
      v_promoted := v_promoted + 1;
    END IF;
  END LOOP;

  FOR v_session_id IN
    SELECT DISTINCT w."sessionId"
    FROM waitlist_entries w
    WHERE w.status = 'WAITING'
  LOOP
    v_promoted_id := public.evaluate_waitlist_promotion(v_session_id);
    IF v_promoted_id IS NOT NULL THEN
      v_promoted := v_promoted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('expired', v_expired, 'promoted', v_promoted);
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_booking(
  p_booking_id text,
  p_to "booking_status",
  p_actor_type "audit_actor_type",
  p_actor_id text,
  p_action text DEFAULT 'booking.transition',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS "booking_status"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from "booking_status";
BEGIN
  SELECT status INTO v_from FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF p_to = 'COMPLETED' THEN
    RAISE EXCEPTION 'completed_blocked_oq10' USING ERRCODE = 'P0001';
  END IF;
  IF NOT app_private.booking_transition_allowed(v_from, p_to) THEN
    RAISE EXCEPTION 'illegal_booking_transition: % -> %', v_from, p_to USING ERRCODE = 'P0001';
  END IF;
  UPDATE bookings
    SET status = p_to, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;
  IF p_to IN ('CONFIRMED', 'CHECKED_IN', 'NO_SHOW') THEN
    PERFORM public.consume_bundle_redemption(p_booking_id);
  END IF;
  IF p_to IN ('REJECTED', 'CANCELLED', 'EXPIRED') THEN
    PERFORM public.restore_bundle_redemption(p_booking_id, lower(p_to::text));
  END IF;
  PERFORM app_private.write_audit(
    'booking', p_booking_id, p_action, p_actor_type, p_actor_id,
    v_from::text, p_to::text, p_metadata
  );
  RETURN p_to;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_cancellation_request(
  p_request_id text,
  p_resolver_id text,
  p_resolution "request_resolution",
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req cancellation_requests%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_restore "booking_status";
BEGIN
  IF p_resolution = 'OPEN' THEN
    RAISE EXCEPTION 'invalid_resolution' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_req FROM cancellation_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.resolution <> 'OPEN' THEN
    RAISE EXCEPTION 'request_not_open' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_booking FROM bookings WHERE id = v_req."bookingId" FOR UPDATE;

  UPDATE cancellation_requests
    SET resolution = p_resolution,
        "resolverId" = p_resolver_id,
        "resolvedAt" = clock_timestamp(),
        "resolutionNote" = p_note,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_request_id;

  IF p_resolution = 'COMPLETED' THEN
    PERFORM public.transition_booking(
      v_booking.id, 'CANCELLED', 'STAFF', p_resolver_id,
      'cancellation.complete', jsonb_build_object('requestId', p_request_id)
    );
    PERFORM public.evaluate_waitlist_promotion(v_booking."sessionId");
  ELSE
    SELECT (a."beforeStatus")::"booking_status" INTO v_restore
    FROM audit_events a
    WHERE a."entityId" = v_booking.id
      AND a.action = 'cancellation.request'
    ORDER BY a."occurredAt" DESC
    LIMIT 1;
    IF v_restore IS NULL THEN
      v_restore := 'CONFIRMED';
    END IF;
    UPDATE bookings SET status = v_restore, "updatedAt" = CURRENT_TIMESTAMP WHERE id = v_booking.id;
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'cancellation.reject', 'STAFF', p_resolver_id,
      'CANCELLATION_REQUESTED', v_restore::text,
      jsonb_build_object('requestId', p_request_id)
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_reschedule_request(
  p_request_id text,
  p_resolver_id text,
  p_resolution "request_resolution",
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req reschedule_requests%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_target sessions%ROWTYPE;
  v_restore "booking_status";
BEGIN
  SELECT * INTO v_req FROM reschedule_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.resolution <> 'OPEN' THEN
    RAISE EXCEPTION 'request_not_open' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_booking FROM bookings WHERE id = v_req."bookingId" FOR UPDATE;

  UPDATE reschedule_requests
    SET resolution = p_resolution,
        "resolverId" = p_resolver_id,
        "resolvedAt" = clock_timestamp(),
        "resolutionNote" = p_note,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_request_id;

  IF p_resolution = 'COMPLETED' THEN
    IF v_req."targetSessionId" IS NULL THEN
      RAISE EXCEPTION 'target_session_required' USING ERRCODE = 'P0001';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(v_req."targetSessionId", 0));
    SELECT * INTO v_target FROM sessions WHERE id = v_req."targetSessionId";
    IF app_private.session_consumed_capacity(v_target.id) >= v_target.capacity THEN
      RAISE EXCEPTION 'target_session_full' USING ERRCODE = 'P0001';
    END IF;
    PERFORM public.move_bundle_redemption(v_booking.id, v_target.id);
    UPDATE bookings
      SET "sessionId" = v_target.id,
          status = 'CONFIRMED',
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_booking.id;
    PERFORM public.consume_bundle_redemption(v_booking.id);
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'reschedule.approve', 'STAFF', p_resolver_id,
      'RESCHEDULE_REQUESTED', 'CONFIRMED',
      jsonb_build_object(
        'requestId', p_request_id,
        'fromSessionId', v_req."fromSessionId",
        'toSessionId', v_target.id
      )
    );
    PERFORM public.evaluate_waitlist_promotion(v_req."fromSessionId");
  ELSE
    SELECT (a."beforeStatus")::"booking_status" INTO v_restore
    FROM audit_events a
    WHERE a."entityId" = v_booking.id AND a.action = 'reschedule.request'
    ORDER BY a."occurredAt" DESC LIMIT 1;
    IF v_restore IS NULL THEN
      v_restore := 'CONFIRMED';
    END IF;
    UPDATE bookings SET status = v_restore, "updatedAt" = CURRENT_TIMESTAMP WHERE id = v_booking.id;
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'reschedule.reject', 'STAFF', p_resolver_id,
      'RESCHEDULE_REQUESTED', v_restore::text,
      jsonb_build_object('requestId', p_request_id)
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.hold_bundle_redemption(text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_bundle_redemption(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restore_bundle_redemption(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_bundle_redemption(text, text) FROM PUBLIC, anon, authenticated;
