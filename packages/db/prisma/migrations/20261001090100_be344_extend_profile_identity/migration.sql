-- #344 Profile identity extensions. Forward-only and additive.
--   1. enums fitness_goal / experience_level / heard_from_source / referral_channel;
--   2. profiles: firstName / lastName (backfilled from fullName), nickname, avatarKey,
--      showOnPublicRoster, referralCode (backfilled), referredById, referralChannel,
--      onboarding timestamps. fullName stays as a DEPRECATED derived column;
--   3. profile_onboarding + profile_class_interests (no rows created for existing users);
--   4. pending_uploads.profileId customer actor (BE-052 flow, purpose 'profile_avatar');
--   5. handle_new_user: first/last name, referral code, share-link attribution;
--   6. RLS: column-scoped customer writes on profiles, onboarding owner/staff/coach reads,
--      avatars storage object policies.
-- OQ-3 still stands: no DOB / health / injury / emergency-contact columns.
-- Name backfill caveat (epic #343 §8 Q1): split on the first space, so compound first
-- names ("Maria Clara Santos" → "Maria" / "Clara Santos") need a manual fix in profile.

BEGIN;

-- ---------------------------------------------------------------------------
-- Enums. Values match @balanse/domain onboarding.ts option lists (#346).
-- ---------------------------------------------------------------------------
CREATE TYPE "fitness_goal" AS ENUM (
  'STRENGTH',
  'FLEXIBILITY_MOBILITY',
  'WEIGHT_MANAGEMENT',
  'STRESS_RELIEF',
  'POSTURE_CORE',
  'ENDURANCE',
  'COMMUNITY',
  'OTHER'
);

CREATE TYPE "experience_level" AS ENUM ('NEW', 'SOME', 'REGULAR', 'ADVANCED');

CREATE TYPE "heard_from_source" AS ENUM (
  'FRIEND',
  'INSTAGRAM',
  'FACEBOOK',
  'TIKTOK',
  'GOOGLE',
  'EVENT',
  'WALK_IN',
  'OTHER'
);

CREATE TYPE "referral_channel" AS ENUM ('CUSTOMER_LINK', 'CUSTOMER_QR', 'STUDIO_LINK', 'STUDIO_QR');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Splits on the first space: "Maria Clara Santos" → ('Maria', 'Clara Santos').
-- Single-word names keep last_name = ''.
CREATE OR REPLACE FUNCTION app_private.split_full_name(
  p_full_name text,
  OUT first_name text,
  OUT last_name text
)
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT
    split_part(btrim(COALESCE(p_full_name, '')), ' ', 1),
    btrim(substr(
      btrim(COALESCE(p_full_name, '')),
      char_length(split_part(btrim(COALESCE(p_full_name, '')), ' ', 1)) + 1
    ));
$$;

-- 8 chars of Crockford base32 (no I, L, O, U) from gen_random_uuid() bytes that carry
-- no version/variant bits. Not derived from the email or the id. Collision-safe loop;
-- the unique index is the final guard. SECURITY DEFINER so the uniqueness probe sees
-- every row regardless of the caller's RLS (it runs as a column DEFAULT).
CREATE OR REPLACE FUNCTION app_private.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  v_bytes bytea;
  v_code text;
  v_attempt integer := 0;
BEGIN
  LOOP
    v_attempt := v_attempt + 1;
    v_bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v_code := '';
    FOR i IN 0..7 LOOP
      v_code := v_code || substr(
        v_alphabet,
        (get_byte(v_bytes, CASE WHEN i < 4 THEN i ELSE i + 6 END) % 32) + 1,
        1
      );
    END LOOP;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p."referralCode" = v_code
    );
    IF v_attempt >= 20 THEN
      RAISE EXCEPTION 'referral_code_generation_exhausted' USING ERRCODE = 'P0001';
    END IF;
  END LOOP;
  RETURN v_code;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles: new columns
-- ---------------------------------------------------------------------------
ALTER TABLE "profiles"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "nickname" TEXT,
  -- IF NOT EXISTS: 20261001130000_profile_avatar_storage may have added it first.
  ADD COLUMN IF NOT EXISTS "avatarKey" TEXT,
  ADD COLUMN "showOnPublicRoster" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "referralCode" TEXT,
  ADD COLUMN "referredById" UUID,
  ADD COLUMN "referralChannel" "referral_channel",
  ADD COLUMN "onboardingCompletedAt" TIMESTAMPTZ,
  ADD COLUMN "onboardingSkippedAt" TIMESTAMPTZ;

-- Created before the backfill so the generator's uniqueness probe is indexed.
CREATE UNIQUE INDEX "profiles_referralCode_key" ON "profiles"("referralCode");

-- Name backfill from fullName (split on the first space). Empty legacy names fall back
-- to the email local part, then 'Member' (same order as handle_new_user).
UPDATE "profiles" p
SET
  "firstName" = COALESCE(
    NULLIF(s.first_name, ''),
    NULLIF(split_part(p.email, '@', 1), ''),
    'Member'
  ),
  "lastName" = s.last_name
FROM (
  SELECT id, (app_private.split_full_name("fullName")).*
  FROM "profiles"
) s
WHERE s.id = p.id;

-- Normalize the deprecated column to its derived form before the sync trigger exists
-- (no updatedAt bump on backfill).
UPDATE "profiles"
SET "fullName" = btrim("firstName" || ' ' || "lastName")
WHERE "fullName" IS DISTINCT FROM btrim("firstName" || ' ' || "lastName");

-- Referral code backfill. Row by row so each generated code is visible to the next
-- uniqueness probe inside this transaction.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE "referralCode" IS NULL ORDER BY "createdAt", id LOOP
    UPDATE public.profiles
    SET "referralCode" = app_private.generate_referral_code()
    WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE "profiles" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "profiles" ALTER COLUMN "referralCode" SET NOT NULL;
ALTER TABLE "profiles" ALTER COLUMN "referralCode" SET DEFAULT app_private.generate_referral_code();
-- fullName is derived by trigger below; the default lets new writers omit it.
ALTER TABLE "profiles" ALTER COLUMN "fullName" SET DEFAULT '';

ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_avatar_key_owner";

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_first_name_present"
    CHECK (char_length(btrim("firstName")) > 0),
  ADD CONSTRAINT "profiles_nickname_length"
    CHECK ("nickname" IS NULL OR char_length(btrim("nickname")) BETWEEN 2 AND 30),
  ADD CONSTRAINT "profiles_avatar_key_owner"
    CHECK (
      "avatarKey" IS NULL
      OR "avatarKey" ~ ('^avatars/' || "id"::text || '/[A-Za-z0-9_-]+\.(webp|jpg|jpeg|png)$')
    ),
  ADD CONSTRAINT "profiles_referral_code_format"
    CHECK ("referralCode" ~ '^[0-9A-HJKMNP-TV-Z]{8}$'),
  ADD CONSTRAINT "profiles_no_self_referral"
    CHECK ("referredById" IS NULL OR "referredById" <> "id");

CREATE INDEX "profiles_referredById_idx" ON "profiles"("referredById");
CREATE INDEX "profiles_onboardingCompletedAt_idx" ON "profiles"("onboardingCompletedAt");

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_referredById_fkey"
  FOREIGN KEY ("referredById") REFERENCES "profiles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON TABLE "profiles" IS
  'BE-002 customer identity. OQ-3: no DOB, health, or emergency-contact columns. #344 adds non-sensitive display/preference data (first/last name, nickname, avatar, roster opt-out, onboarding timestamps, share attribution). Created by app_private.handle_new_user on auth.users insert.';
COMMENT ON COLUMN "profiles"."fullName" IS
  'DEPRECATED (#344). Derived trim(firstName || '' '' || lastName) by trigger profiles_sync_full_name. Do not write. Dropped in a follow-up.';
COMMENT ON COLUMN "profiles"."avatarKey" IS
  '#344 object key in the private avatars bucket: avatars/<profileId>/<cuid>.webp. Served only via short-lived signed URLs.';
COMMENT ON COLUMN "profiles"."referralCode" IS
  '#344 share code (8 chars Crockford base32). Generated on insert. Not customer-writable.';

-- ---------------------------------------------------------------------------
-- fullName sync. Legacy writers that still send only fullName (pre-#344 code paths)
-- get first/last derived from it, so expand → migrate → contract stays safe.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.sync_profile_full_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_first text;
  v_last text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW."firstName" IS NULL THEN
      SELECT s.first_name, s.last_name INTO v_first, v_last
      FROM app_private.split_full_name(NEW."fullName") s;
      NEW."firstName" := v_first;
      IF COALESCE(NEW."lastName", '') = '' THEN
        NEW."lastName" := v_last;
      END IF;
    END IF;
  ELSIF NEW."fullName" IS DISTINCT FROM OLD."fullName"
    AND NEW."firstName" IS NOT DISTINCT FROM OLD."firstName"
    AND NEW."lastName" IS NOT DISTINCT FROM OLD."lastName"
  THEN
    SELECT s.first_name, s.last_name INTO v_first, v_last
    FROM app_private.split_full_name(NEW."fullName") s;
    NEW."firstName" := v_first;
    NEW."lastName" := v_last;
  END IF;

  NEW."fullName" := btrim(COALESCE(NEW."firstName", '') || ' ' || COALESCE(NEW."lastName", ''));

  -- Customers cannot write updatedAt through the Data API (column grants below).
  IF TG_OP = 'UPDATE' THEN
    NEW."updatedAt" := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_full_name ON public.profiles;
CREATE TRIGGER profiles_sync_full_name
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION app_private.sync_profile_full_name();

-- ---------------------------------------------------------------------------
-- profile_onboarding (1:1) + profile_class_interests
-- ---------------------------------------------------------------------------
CREATE TABLE "profile_onboarding" (
  "profileId" UUID NOT NULL,
  "goals" "fitness_goal"[] NOT NULL DEFAULT ARRAY[]::"fitness_goal"[],
  "goalsOther" TEXT NOT NULL DEFAULT '',
  "experienceLevel" "experience_level",
  "interestsOther" TEXT NOT NULL DEFAULT '',
  "heardFrom" "heard_from_source",
  "heardFromOther" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "profile_onboarding_pkey" PRIMARY KEY ("profileId"),
  CONSTRAINT "profile_onboarding_goals_other_length" CHECK (char_length("goalsOther") <= 120),
  CONSTRAINT "profile_onboarding_interests_other_length" CHECK (char_length("interestsOther") <= 120),
  CONSTRAINT "profile_onboarding_heard_from_other_length" CHECK (char_length("heardFromOther") <= 120)
);

ALTER TABLE "profile_onboarding"
  ADD CONSTRAINT "profile_onboarding_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON TABLE "profile_onboarding" IS
  '#344 non-sensitive onboarding answers (1:1 profile). Missing row = not started. OQ-3: no medical/injury/DOB/emergency data. Never returned by public or customer-to-customer surfaces.';

CREATE TABLE "profile_class_interests" (
  "id" TEXT NOT NULL,
  "profileId" UUID NOT NULL,
  "classId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "profile_class_interests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profile_class_interests_profileId_classId_key"
  ON "profile_class_interests"("profileId", "classId");
CREATE INDEX "profile_class_interests_classId_idx" ON "profile_class_interests"("classId");

ALTER TABLE "profile_class_interests"
  ADD CONSTRAINT "profile_class_interests_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profile_onboarding"("profileId")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "profile_class_interests"
  ADD CONSTRAINT "profile_class_interests_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "classes"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON TABLE "profile_class_interests" IS
  '#344 onboarding "Interests" step: classes a customer is curious about.';

-- ---------------------------------------------------------------------------
-- pending_uploads: customer actor (BE-052 signed-upload/confirm/reap, 'profile_avatar')
-- ---------------------------------------------------------------------------
ALTER TABLE "pending_uploads" ADD COLUMN "profileId" UUID;

CREATE INDEX "pending_uploads_profileId_idx" ON "pending_uploads"("profileId");

ALTER TABLE "pending_uploads"
  ADD CONSTRAINT "pending_uploads_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pending_uploads"
  ADD CONSTRAINT "pending_uploads_single_actor"
  CHECK ("actorId" IS NULL OR "profileId" IS NULL);

-- ---------------------------------------------------------------------------
-- Sign-up trigger. Keeps ON CONFLICT (id) DO NOTHING.
--   firstName: first_name → given_name → first token of full_name/name → email local part → 'Member'
--   lastName:  last_name → family_name → remainder of full_name/name → ''
--   Attribution (never fails sign-up):
--     ref matches another profile's referralCode (not self, not a staff-only profile)
--       → referredById + referralChannel (CUSTOMER_* from ref_channel, default CUSTOMER_LINK);
--     no valid ref → referralChannel only for STUDIO_LINK / STUDIO_QR;
--     ref_channel accepted only when it is a valid referral_channel value.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_full text;
  v_split_first text;
  v_split_last text;
  v_first text;
  v_last text;
  v_ref text;
  v_ref_channel text;
  v_channel public.referral_channel;
  v_referrer uuid;
BEGIN
  v_full := COALESCE(
    NULLIF(btrim(v_meta->>'full_name'), ''),
    NULLIF(btrim(v_meta->>'name'), ''),
    ''
  );
  SELECT s.first_name, s.last_name INTO v_split_first, v_split_last
  FROM app_private.split_full_name(v_full) s;

  v_first := COALESCE(
    NULLIF(btrim(v_meta->>'first_name'), ''),
    NULLIF(btrim(v_meta->>'given_name'), ''),
    NULLIF(v_split_first, ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Member'
  );
  v_last := COALESCE(
    NULLIF(btrim(v_meta->>'last_name'), ''),
    NULLIF(btrim(v_meta->>'family_name'), ''),
    NULLIF(v_split_last, ''),
    ''
  );

  BEGIN
    v_ref := upper(NULLIF(btrim(v_meta->>'ref'), ''));
    v_ref_channel := upper(NULLIF(btrim(v_meta->>'ref_channel'), ''));

    IF v_ref_channel IS NOT NULL
       AND v_ref_channel = ANY (enum_range(NULL::public.referral_channel)::text[])
    THEN
      v_channel := v_ref_channel::public.referral_channel;
    END IF;

    IF v_ref IS NOT NULL THEN
      SELECT p.id INTO v_referrer
      FROM public.profiles p
      WHERE p."referralCode" = v_ref
        AND p.id <> NEW.id
        AND NOT (
          EXISTS (SELECT 1 FROM public.staff_members sm WHERE sm."userId" = p.id)
          AND NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b."profileId" = p.id)
        )
      LIMIT 1;
    END IF;

    IF v_referrer IS NOT NULL THEN
      IF v_channel IS NULL OR v_channel NOT IN ('CUSTOMER_LINK', 'CUSTOMER_QR') THEN
        v_channel := 'CUSTOMER_LINK';
      END IF;
    ELSIF v_channel IS NOT NULL AND v_channel NOT IN ('STUDIO_LINK', 'STUDIO_QR') THEN
      v_channel := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_referrer := NULL;
    v_channel := NULL;
  END;

  INSERT INTO public.profiles (
    id,
    "firstName",
    "lastName",
    email,
    "contactNumber",
    "referredById",
    "referralChannel",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id,
    v_first,
    v_last,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    v_referrer,
    v_channel,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Coach own-student scope: roster.read.own + the customer has a booking in a session
-- assigned to the caller's linked coach. Same rule as the profiles_self_select coach
-- clause (#298 owns_session / linked_coach_id), packaged for reuse.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.coach_can_read_customer(p_uid uuid, p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.has_permission(p_uid, 'roster.read.own')
     AND EXISTS (
       SELECT 1
       FROM public.bookings b
       JOIN public.session_coaches sc ON sc."sessionId" = b."sessionId"
       WHERE b."profileId" = p_profile_id
         AND sc."coachId" = app_private.linked_coach_id(p_uid)
     );
$$;

COMMENT ON FUNCTION app_private.coach_can_read_customer(uuid, uuid) IS
  '#344 coach own-student scope: roster.read.own and a booking for the customer in a session assigned to the caller''s linked coach.';

REVOKE ALL ON FUNCTION app_private.split_full_name(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.generate_referral_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.sync_profile_full_name() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.coach_can_read_customer(uuid, uuid) FROM PUBLIC;
-- RLS policy expressions run with the caller's privileges. The #298 helpers were
-- revoked from PUBLIC without a grant back to `authenticated`, so any policy that calls
-- them raised "permission denied for function has_permission" for Data API callers.
-- These are SECURITY DEFINER boolean/id checks in a schema the Data API does not expose;
-- public.has_permission(uuid, text) already offers the same answer to anon/authenticated.
GRANT EXECUTE ON FUNCTION app_private.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.linked_coach_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.owns_session(uuid, text) TO authenticated;
-- generate_referral_code runs as the profiles.referralCode DEFAULT for any inserter.
GRANT EXECUTE ON FUNCTION app_private.generate_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.sync_profile_full_name() TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.coach_can_read_customer(uuid, uuid) TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION app_private.generate_referral_code() TO service_role;
    GRANT EXECUTE ON FUNCTION app_private.sync_profile_full_name() TO service_role;
    GRANT EXECUTE ON FUNCTION app_private.coach_can_read_customer(uuid, uuid) TO service_role;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- RLS: profiles. The customer updates only their own row (profiles_self_update) and
-- only these columns. referralCode / referredById / referralChannel / email / fullName
-- are not customer-writable. Prisma (table owner) bypasses grants and RLS.
-- ---------------------------------------------------------------------------
REVOKE INSERT, UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT INSERT (
  "id",
  "firstName",
  "lastName",
  "email",
  "contactNumber",
  "nickname",
  "avatarKey",
  "showOnPublicRoster",
  "createdAt",
  "updatedAt"
) ON public.profiles TO authenticated;
GRANT UPDATE (
  "firstName",
  "lastName",
  "nickname",
  "avatarKey",
  "showOnPublicRoster",
  "contactNumber",
  "onboardingCompletedAt",
  "onboardingSkippedAt"
) ON public.profiles TO authenticated;

-- Re-state profiles_self_select with the shared coach helper. The #298 version's coach
-- clause compared bookings."profileId" to an unqualified `id` (resolves to bookings.id).
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'customers.read'))
    OR app_private.coach_can_read_customer((SELECT auth.uid()), id)
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

-- ---------------------------------------------------------------------------
-- RLS: onboarding. Owner full CRUD. customers.read (or Super Admin) reads.
-- Coach role reads its own students only. No anon access. Self-edits are not audited.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profile_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_class_interests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profile_onboarding FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.profile_class_interests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_onboarding TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_class_interests TO authenticated;

CREATE POLICY profile_onboarding_owner_all
  ON public.profile_onboarding
  FOR ALL
  TO authenticated
  USING ("profileId" = (SELECT auth.uid()))
  WITH CHECK ("profileId" = (SELECT auth.uid()));

CREATE POLICY profile_onboarding_staff_read
  ON public.profile_onboarding
  FOR SELECT
  TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'customers.read'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
    OR app_private.coach_can_read_customer((SELECT auth.uid()), "profileId")
  );

CREATE POLICY profile_class_interests_owner_all
  ON public.profile_class_interests
  FOR ALL
  TO authenticated
  USING ("profileId" = (SELECT auth.uid()))
  WITH CHECK ("profileId" = (SELECT auth.uid()));

CREATE POLICY profile_class_interests_staff_read
  ON public.profile_class_interests
  FOR SELECT
  TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'customers.read'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
    OR app_private.coach_can_read_customer((SELECT auth.uid()), "profileId")
  );

-- ---------------------------------------------------------------------------
-- Storage: avatars (private). Key: avatars/<profileId>/<cuid>.webp
-- Owner writes/reads under their own <profileId>/ prefix; customers.read staff read.
-- No anon read, no customer-to-customer read. Roster avatars use server-minted
-- signed URLs (service role) for keys returned by app_public.public_session_roster.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects missing — skip #344 avatars policies (plain Postgres).';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS avatars_owner_select ON storage.objects;
  DROP POLICY IF EXISTS avatars_owner_insert ON storage.objects;
  DROP POLICY IF EXISTS avatars_owner_update ON storage.objects;
  DROP POLICY IF EXISTS avatars_owner_delete ON storage.objects;
  DROP POLICY IF EXISTS avatars_staff_read ON storage.objects;

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

  CREATE POLICY avatars_staff_read ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'customers.read'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    );
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
