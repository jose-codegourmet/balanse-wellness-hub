-- Class publishing is an additive, independently deployable exception to mock-only UI.
BEGIN;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS slug text,
 ADD COLUMN IF NOT EXISTS "customPageUrl" text,
 ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS "heroImage" text,
 ADD COLUMN IF NOT EXISTS "galleryImages" text[] NOT NULL DEFAULT '{}';
UPDATE public.classes SET slug = 'class-' || substr(md5(id),1,20) WHERE slug IS NULL;
ALTER TABLE public.classes ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS classes_slug_key ON public.classes(slug);
ALTER TABLE public.classes ADD CONSTRAINT classes_marketing_slug_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug)<=100),
 ADD CONSTRAINT classes_marketing_description_check CHECK (length(description)<=4000),
 ADD CONSTRAINT classes_marketing_gallery_check CHECK (cardinality("galleryImages")<=12),
 ADD CONSTRAINT classes_marketing_redirect_check CHECK ("customPageUrl" IS NULL OR
   ("customPageUrl" ~ '^(https://[^/[:space:]]+(/|$)|/[^/])' AND "customPageUrl" !~ '[[:space:]\\\\]'));
CREATE TABLE public.class_marketing_coaches (
 id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
 "classId" text NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
 "coachId" text NOT NULL REFERENCES public.coaches(id),
 "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("classId","coachId")
);
CREATE INDEX class_marketing_coaches_coachId_idx ON public.class_marketing_coaches("coachId");
ALTER TABLE public.class_marketing_coaches ENABLE ROW LEVEL SECURITY;
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated, anon;
-- Private authorization helper prevents staff-table policy recursion. Never trusts user_metadata.
CREATE OR REPLACE FUNCTION app_private.catalogue_is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS (
 SELECT 1 FROM public.staff_members WHERE "userId"=auth.uid() AND role='ADMIN' AND status='ACTIVE' AND NOT "isSystem");
$$;
REVOKE ALL ON FUNCTION app_private.catalogue_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.catalogue_is_admin() TO authenticated, anon;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogue_class_read ON public.classes FOR SELECT TO anon,authenticated USING (active OR (select app_private.catalogue_is_admin()));
CREATE POLICY catalogue_class_insert ON public.classes FOR INSERT TO authenticated WITH CHECK ((select app_private.catalogue_is_admin()));
CREATE POLICY catalogue_class_update ON public.classes FOR UPDATE TO authenticated USING ((select app_private.catalogue_is_admin())) WITH CHECK ((select app_private.catalogue_is_admin()));
CREATE POLICY catalogue_coach_read ON public.coaches FOR SELECT TO anon,authenticated USING (active OR (select app_private.catalogue_is_admin()));
CREATE POLICY catalogue_staff_self ON public.staff_members FOR SELECT TO authenticated USING ("userId"=(select auth.uid()));
CREATE POLICY catalogue_roster_read ON public.class_marketing_coaches FOR SELECT TO anon,authenticated USING (EXISTS (SELECT 1 FROM public.classes WHERE id="classId" AND (active OR (select app_private.catalogue_is_admin()))));
CREATE POLICY catalogue_roster_write ON public.class_marketing_coaches FOR ALL TO authenticated USING ((select app_private.catalogue_is_admin())) WITH CHECK ((select app_private.catalogue_is_admin()));
GRANT SELECT ON public.classes,public.class_marketing_coaches TO anon,authenticated;
GRANT INSERT,UPDATE ON public.classes TO authenticated;
GRANT INSERT,UPDATE,DELETE ON public.class_marketing_coaches TO authenticated;
-- Public catalogue identity projection must not grant access to coach compensation.
REVOKE SELECT ON public.coaches FROM anon,authenticated;
GRANT SELECT(id,name,specialties,"shortBio","photoKey",active) ON public.coaches TO anon,authenticated;
GRANT SELECT(id,"userId",role,status,"isSystem") ON public.staff_members TO authenticated;
CREATE OR REPLACE FUNCTION public.save_class_catalogue(payload jsonb) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE target_id text; coach_ids text[]; assigned_id text;
BEGIN
 IF NOT app_private.catalogue_is_admin() THEN RAISE EXCEPTION 'Admin sign-in required' USING ERRCODE='42501'; END IF;
 target_id := COALESCE(NULLIF(payload->>'id',''),gen_random_uuid()::text);
 SELECT COALESCE(array_agg(value),'{}') INTO coach_ids FROM jsonb_array_elements_text(COALESCE(payload->'coachIds','[]'::jsonb));
 IF cardinality(coach_ids)>100 OR cardinality(coach_ids)<>(SELECT count(DISTINCT x) FROM unnest(coach_ids) x) THEN RAISE EXCEPTION 'Invalid coach selection'; END IF;
 IF length(trim(payload->>'name')) NOT BETWEEN 1 AND 80 OR length(payload->>'shortDescription') NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Invalid class name or description'; END IF;
 IF payload->>'id' IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.classes WHERE id=target_id) THEN RAISE EXCEPTION 'Class not found'; END IF;
 -- Lock before validating retained inactive assignments and replacing the marketing roster.
 PERFORM id FROM public.classes WHERE id=target_id FOR UPDATE;
 FOREACH assigned_id IN ARRAY coach_ids LOOP
  IF NOT EXISTS(SELECT 1 FROM public.coaches c WHERE c.id=assigned_id AND (c.active OR EXISTS(SELECT 1 FROM public.class_marketing_coaches m WHERE m."classId"=target_id AND m."coachId"=assigned_id))) THEN RAISE EXCEPTION 'Choose active coaches'; END IF;
 END LOOP;
 INSERT INTO public.classes(id,name,slug,"shortDescription",description,"heroImage","galleryImages","customPageUrl","defaultDurationMinutes","defaultCustomerPrice",active,"updatedAt")
 VALUES(target_id,trim(payload->>'name'),payload->>'slug',payload->>'shortDescription',COALESCE(payload->>'description',''),NULLIF(payload->>'heroImage',''),
 ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'galleryImages','[]'::jsonb))),NULLIF(payload->>'customPageUrl',''),
 (payload->>'defaultDurationMinutes')::integer,(payload->>'defaultPricePhp')::numeric,COALESCE((payload->>'active')::boolean,false),CURRENT_TIMESTAMP)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,"shortDescription"=excluded."shortDescription",description=excluded.description,
 "heroImage"=excluded."heroImage","galleryImages"=excluded."galleryImages","customPageUrl"=excluded."customPageUrl",
 "defaultDurationMinutes"=excluded."defaultDurationMinutes","defaultCustomerPrice"=excluded."defaultCustomerPrice",active=excluded.active,"updatedAt"=CURRENT_TIMESTAMP;
 DELETE FROM public.class_marketing_coaches WHERE "classId"=target_id AND NOT ("coachId"=ANY(coach_ids));
 INSERT INTO public.class_marketing_coaches("classId","coachId") SELECT target_id,unnest(coach_ids) ON CONFLICT("classId","coachId") DO NOTHING;
 RETURN target_id;
END; $$;
REVOKE ALL ON FUNCTION public.save_class_catalogue(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_class_catalogue(jsonb) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
