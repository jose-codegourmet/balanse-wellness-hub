-- Restore WIRE-E05 catalogue grants lost when the earlier RLS baseline was replayed.
-- Keep the existing row policies and SECURITY INVOKER save RPC in force.
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_marketing_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.classes, public.class_marketing_coaches TO anon, authenticated;
GRANT INSERT, UPDATE ON public.classes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.class_marketing_coaches TO authenticated;

-- A table-wide SELECT overrides column restrictions. Restore the original
-- public identity projection; protected rate reads still go through staff APIs.
REVOKE SELECT ON public.coaches FROM anon, authenticated;
REVOKE SELECT ("defaultRate", "rateType") ON public.coaches FROM anon, authenticated;
GRANT SELECT (id, name, specialties, "shortBio", "photoKey", active)
  ON public.coaches TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
