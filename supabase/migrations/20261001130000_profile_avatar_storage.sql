-- Customer profile photos in Supabase Storage (apps/web, 2026-10-01).
--
-- The avatar slice of #344 (20261001090000_be344_create_avatars_bucket and
-- 20261001090100_be344_extend_profile_identity), on its own, because the hosted
-- project is behind the other migrations #344 depends on (pending_uploads,
-- session_coaches helpers, ...). Every statement is idempotent and uses the
-- #344 names, so #344 can still be applied later.
--
--   1. Private `avatars` bucket: JPG/PNG/WEBP, 5 MB.
--   2. profiles."avatarKey": `avatars/<profileId>/<id>.<ext>`, owner prefix enforced.
--   3. Storage RLS: a signed-in user reads/writes/deletes only under
--      `avatars/<their uid>/`. No anon read, no customer-to-customer read; the
--      app serves photos through short-lived signed URLs.

BEGIN;

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'storage.buckets missing — skip avatars bucket (plain Postgres).';
    RETURN;
  END IF;

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'avatars',
    'avatars',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  )
  ON CONFLICT (id) DO UPDATE
  SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "avatarKey" TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS "profiles_avatar_key_owner";
ALTER TABLE public.profiles
  ADD CONSTRAINT "profiles_avatar_key_owner"
    CHECK (
      "avatarKey" IS NULL
      OR "avatarKey" ~ ('^avatars/' || "id"::text || '/[A-Za-z0-9_-]+\.(webp|jpg|jpeg|png)$')
    );

COMMENT ON COLUMN public.profiles."avatarKey" IS
  '#344 object key in the private avatars bucket: avatars/<profileId>/<id>.<ext>. Served only via short-lived signed URLs.';

-- Pre-#344 projects grant table-wide UPDATE; #344 replaces that with column
-- grants that already include avatarKey. Either way the owner can set it.
GRANT UPDATE ("avatarKey") ON public.profiles TO authenticated;

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects missing — skip avatars policies (plain Postgres).';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS avatars_owner_select ON storage.objects;
  DROP POLICY IF EXISTS avatars_owner_insert ON storage.objects;
  DROP POLICY IF EXISTS avatars_owner_update ON storage.objects;
  DROP POLICY IF EXISTS avatars_owner_delete ON storage.objects;

  CREATE POLICY avatars_owner_select ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
    );

  CREATE POLICY avatars_owner_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
    );

  CREATE POLICY avatars_owner_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
    )
    WITH CHECK (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
    );

  CREATE POLICY avatars_owner_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = 'avatars'
      AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
    );
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
