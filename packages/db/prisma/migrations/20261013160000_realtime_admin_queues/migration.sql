-- Realtime change feed for the admin inbox and queues (2026-10-13).
--
-- Adds the tables behind the admin inbox and payment/request queues to the
-- `supabase_realtime` publication so signed-in staff browsers are told when a
-- row changes and can refetch through the API. Realtime applies each table's
-- existing RLS SELECT policies per subscriber: staff with the matching read
-- permission receive changes; customers receive only their own rows; `anon`
-- receives nothing. No grants, policies, or data change here.
--
-- Idempotent, and skipped on plain Postgres where the publication is absent.
-- `class_change_requests` joins once WIRE-2001 is deployed to the shared project.

DO $$
DECLARE
  v_table text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'supabase_realtime publication missing; skipping (plain Postgres).';
    RETURN;
  END IF;
  FOREACH v_table IN ARRAY ARRAY['bookings', 'payments', 'cancellation_requests', 'reschedule_requests']
  LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = v_table
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_table);
    END IF;
  END LOOP;
END $$;
