-- profiles: owner RLS policies (apps/web Supabase Auth, 2026-10-01).
--
-- The hosted project has RLS enabled on public.profiles but no policies (the
-- policy part of 20260919120200_be020_022_rls_storage_reporting was never
-- applied), so a signed-in customer could not read, create or update their
-- own row. Same policies as be020_022; idempotent. #344 later re-states
-- profiles_self_select with its coach clause.

BEGIN;

DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
DROP POLICY IF EXISTS profiles_self_insert ON public.profiles;

CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())));

CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())))
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())));

CREATE POLICY profiles_self_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())));

NOTIFY pgrst, 'reload schema';

COMMIT;
