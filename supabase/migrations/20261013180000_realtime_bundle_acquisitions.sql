-- Realtime change feed for paid package requests (2026-10-13).
--
-- Follows `realtime_admin_queues`: adds `bundle_acquisitions` and
-- `bundle_acquisition_payments` (BE-058) to the `supabase_realtime` publication so
-- the admin inbox's package-payment count and the /bundles review list update live
-- when a customer submits a GCash receipt or chooses a method. Each table's RLS
-- SELECT policy applies per subscriber (admins see all rows; a customer sees only
-- their own). Idempotent, and a no-op on plain Postgres or before the tables exist.

DO $$
DECLARE
  t text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'supabase_realtime publication missing; skipping (plain Postgres).';
    RETURN;
  END IF;
  FOREACH t IN ARRAY ARRAY['bundle_acquisitions', 'bundle_acquisition_payments'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
