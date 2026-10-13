-- Realtime change feed for coach class-change requests (2026-10-13).
--
-- Follows `realtime_admin_queues`: adds `class_change_requests` (WIRE-2001) to the
-- `supabase_realtime` publication so the admin inbox's class-change count and the
-- request queue update live. The table's RLS SELECT policy applies per subscriber
-- (reviewers see all requests; a coach sees only their own). Idempotent, and a
-- no-op on plain Postgres or before the table exists.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'supabase_realtime publication missing; skipping (plain Postgres).';
    RETURN;
  END IF;
  IF to_regclass('public.class_change_requests') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
         AND tablename = 'class_change_requests'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.class_change_requests;
  END IF;
END $$;
