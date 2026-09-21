-- BE-055 staff/coach capability link + BE-056 payment receive-QR collection.
-- Not applied to the shared hosted project by this PR (contract + schema only).

-- ---------------------------------------------------------------------------
-- BE-055 — Coach.staffMemberId (nullable 1:1). Unlink / staff delete MUST NOT
-- cascade-delete coaches that still have class_coaches / sessions rows.
-- ---------------------------------------------------------------------------
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS "staffMemberId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "coaches_staffMemberId_key"
  ON public.coaches ("staffMemberId");

ALTER TABLE public.coaches
  DROP CONSTRAINT IF EXISTS "coaches_staffMemberId_fkey";
ALTER TABLE public.coaches
  ADD CONSTRAINT "coaches_staffMemberId_fkey"
  FOREIGN KEY ("staffMemberId") REFERENCES public.staff_members(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

COMMENT ON COLUMN public.coaches."staffMemberId" IS
  'BE-055 optional 1:1 staff capability. ON DELETE SET NULL — never CASCADE. isCoach is derived from this FK, not a StaffRole value.';

-- ---------------------------------------------------------------------------
-- BE-056 — payment_qr_codes + payment snapshot FK
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_qr_codes (
  id TEXT NOT NULL,
  label TEXT NOT NULL,
  "imageKey" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "archivedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT payment_qr_codes_pkey PRIMARY KEY (id),
  CONSTRAINT payment_qr_codes_archived_not_active
    CHECK ("archivedAt" IS NULL OR "isActive" = false)
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_qr_codes_imageKey_key"
  ON public.payment_qr_codes ("imageKey");
CREATE INDEX IF NOT EXISTS "payment_qr_codes_isActive_idx"
  ON public.payment_qr_codes ("isActive");
CREATE INDEX IF NOT EXISTS "payment_qr_codes_archivedAt_idx"
  ON public.payment_qr_codes ("archivedAt");

-- Exactly one active, non-archived row (zero allowed while the collection is empty).
CREATE UNIQUE INDEX IF NOT EXISTS payment_qr_codes_one_active
  ON public.payment_qr_codes ((true))
  WHERE "isActive" = true AND "archivedAt" IS NULL;

COMMENT ON TABLE public.payment_qr_codes IS
  'BE-056 GCash receive-QR collection. Partial unique index enforces one active row. Payments snapshot the live row at first proof submit.';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS "paymentQrCodeId" TEXT;

CREATE INDEX IF NOT EXISTS "payments_paymentQrCodeId_idx"
  ON public.payments ("paymentQrCodeId");

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS "payments_paymentQrCodeId_fkey";
ALTER TABLE public.payments
  ADD CONSTRAINT "payments_paymentQrCodeId_fkey"
  FOREIGN KEY ("paymentQrCodeId") REFERENCES public.payment_qr_codes(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Expand → migrate: copy the legacy single-slot key into an active row.
INSERT INTO public.payment_qr_codes (
  id, label, "imageKey", "isActive", "archivedAt", "createdAt", "updatedAt"
)
SELECT
  'qr_migrated_settings_gcash',
  'GCash',
  src.key,
  true,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT NULLIF(BTRIM(value::jsonb #>> '{payment,gcashQrObjectKey}'), '') AS key
  FROM public.app_meta
  WHERE key = 'public_settings'
) src
WHERE src.key IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.payment_qr_codes WHERE id = 'qr_migrated_settings_gcash'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.payment_qr_codes WHERE "isActive" = true AND "archivedAt" IS NULL
  );

-- ---------------------------------------------------------------------------
-- RLS — admin writes; public read of the active QR only (no labels)
-- ---------------------------------------------------------------------------
ALTER TABLE public.payment_qr_codes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.payment_qr_codes FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_qr_codes TO authenticated;

DROP POLICY IF EXISTS payment_qr_codes_admin_all ON public.payment_qr_codes;
CREATE POLICY payment_qr_codes_admin_all ON public.payment_qr_codes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Not security_invoker: base-table RLS is admin-only and would hide the active
-- QR from anon, same pattern as coaches_public.
CREATE OR REPLACE VIEW public.payment_qr_codes_public
WITH (security_barrier = true) AS
SELECT
  q.id,
  q."imageKey",
  q."isActive"
FROM public.payment_qr_codes q
WHERE q."isActive" = true
  AND q."archivedAt" IS NULL;

COMMENT ON VIEW public.payment_qr_codes_public IS
  'BE-056 public projection of the single active receive QR. Omits label and archived rows.';

GRANT SELECT ON public.payment_qr_codes_public TO anon, authenticated;
