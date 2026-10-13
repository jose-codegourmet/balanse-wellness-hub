-- WIRE-1701 (#371) — payment_qr_codes becomes a payment *account* collection:
-- type (GCASH/MAYA/QRPH), accountName, accountNumber; imageKey becomes
-- optional (QR Ph needs one, GCash/Maya don't); several rows may be active
-- at once (decision 2) instead of exactly one.

BEGIN;

CREATE TYPE public.payment_account_type AS ENUM ('GCASH', 'MAYA', 'QRPH');

ALTER TABLE public.payment_qr_codes
  ADD COLUMN IF NOT EXISTS "type" public.payment_account_type NOT NULL DEFAULT 'GCASH',
  ADD COLUMN IF NOT EXISTS "accountName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "accountNumber" TEXT NOT NULL DEFAULT '';

-- Backfill the row the BE-056 migration copied from the legacy settings
-- singleton, if any, from that same singleton's account fields.
UPDATE public.payment_qr_codes q
SET
  "accountName" = COALESCE(NULLIF(BTRIM(src.name), ''), q."accountName"),
  "accountNumber" = COALESCE(NULLIF(BTRIM(src.number), ''), q."accountNumber")
FROM (
  SELECT
    value::jsonb #>> '{payment,gcashAccountName}' AS name,
    value::jsonb #>> '{payment,gcashNumber}' AS number
  FROM public.app_meta
  WHERE key = 'public_settings'
) src
WHERE q.id = 'qr_migrated_settings_gcash';

-- `imageKey` is now optional (QR Ph requires one; GCash/Maya don't). The
-- unique index already treats NULL as distinct, so no index change is needed.
ALTER TABLE public.payment_qr_codes
  ALTER COLUMN "imageKey" DROP NOT NULL;

-- Decision 2: several accounts may be shown to customers at once. The old
-- "at most one active" constraint no longer applies; "at least one active
-- while any non-archived row exists" is a cross-row invariant the handlers
-- enforce (reject archiving/hiding the last visible account), same pattern
-- as the existing "cannot archive the active QR" check.
DROP INDEX IF EXISTS public.payment_qr_codes_one_active;

COMMENT ON TABLE public.payment_qr_codes IS
  'WIRE-1701 payment account collection (GCash/Maya/QR Ph). Several rows may be active (shown at checkout) at once; handlers keep at least one visible while any non-archived row exists.';

-- ---------------------------------------------------------------------------
-- Public projection: every active, non-archived account (not just one).
-- ---------------------------------------------------------------------------
-- Existing columns are (id, imageKey, isActive). The new projection changes
-- their order, which CREATE OR REPLACE VIEW cannot do. Hosted has no view
-- dependents, so DROP with the default RESTRICT guard before recreating it.
DROP VIEW public.payment_qr_codes_public;
CREATE VIEW public.payment_qr_codes_public
WITH (security_barrier = true) AS
SELECT
  q.id,
  q."type",
  q.label,
  q."accountName",
  q."accountNumber",
  q."imageKey",
  q."isActive"
FROM public.payment_qr_codes q
WHERE q."isActive" = true
  AND q."archivedAt" IS NULL;

COMMENT ON VIEW public.payment_qr_codes_public IS
  'WIRE-1701 public projection of every active payment account shown at checkout. Omits archived rows.';

GRANT SELECT ON public.payment_qr_codes_public TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
