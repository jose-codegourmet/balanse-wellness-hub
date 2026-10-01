-- #344: private `avatars` bucket for customer profile photos.
-- Visibility: private. No anon read, no customer-to-customer read.
-- Roster avatars are served through short-lived signed URLs minted server-side (#345).
-- Object RLS lives in 20261001090100_be344_extend_profile_identity.
-- Idempotent so `db:ensure-buckets` can replay it.

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'storage.buckets missing — skip #344 avatars bucket (plain Postgres).';
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
