-- #319 SessionEvent: 1:0..1 wrapper on GymSession.
-- Additive. No backfill of existing sessions. Price and capacity stay on sessions.
-- Slug omitted until a public event surface is approved (#317 Q1).

BEGIN;

CREATE TYPE "event_status" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'ARCHIVED');

CREATE TABLE "session_events" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "posterImage" TEXT,
  "galleryImages" TEXT[] NOT NULL DEFAULT '{}',
  "venueName" TEXT NOT NULL DEFAULT '',
  "venueAddress" TEXT NOT NULL DEFAULT '',
  "beneficiary" TEXT NOT NULL DEFAULT '',
  "whatToBring" TEXT NOT NULL DEFAULT '',
  "internalNotes" TEXT NOT NULL DEFAULT '',
  "registrationOpensAt" TIMESTAMPTZ,
  "registrationClosesAt" TIMESTAMPTZ,
  "status" "event_status" NOT NULL DEFAULT 'DRAFT',
  "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "session_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "session_events_title_present" CHECK (char_length(btrim("title")) > 0),
  CONSTRAINT "session_events_gallery_size" CHECK (cardinality("galleryImages") <= 12),
  CONSTRAINT "session_events_registration_window" CHECK (
    "registrationOpensAt" IS NULL
    OR "registrationClosesAt" IS NULL
    OR "registrationClosesAt" >= "registrationOpensAt"
  )
);

CREATE UNIQUE INDEX "session_events_sessionId_key" ON "session_events"("sessionId");
CREATE INDEX "session_events_status_idx" ON "session_events"("status");
CREATE INDEX "session_events_createdAt_idx" ON "session_events"("createdAt");

ALTER TABLE "session_events"
  ADD CONSTRAINT "session_events_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "sessions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TABLE "session_events" IS
  '#319 operational wrapper on one session. Do not store price or capacity here. No anon read.';

-- ---------------------------------------------------------------------------
-- Invariants
-- One event per session: unique sessionId.
-- Creation / repoint: the session must not be CANCELLED.
-- Publish: event status PUBLISHED only while the session is PUBLISHED.
-- Cancelling a session later does not rewrite the event (handlers own that).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.assert_session_event_invariants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_status public.session_status;
BEGIN
  IF TG_OP = 'INSERT' OR NEW."sessionId" IS DISTINCT FROM OLD."sessionId" THEN
    SELECT s.status INTO v_session_status
    FROM public.sessions s
    WHERE s.id = NEW."sessionId";
    IF NOT FOUND THEN
      RAISE EXCEPTION 'session_not_found' USING ERRCODE = 'P0002';
    END IF;
    IF v_session_status = 'CANCELLED' THEN
      RAISE EXCEPTION 'event_on_cancelled_session' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF NEW.status = 'PUBLISHED'
     AND (
       TG_OP = 'INSERT'
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW."sessionId" IS DISTINCT FROM OLD."sessionId"
     )
  THEN
    SELECT s.status INTO v_session_status
    FROM public.sessions s
    WHERE s.id = NEW."sessionId";
    IF v_session_status IS DISTINCT FROM 'PUBLISHED' THEN
      RAISE EXCEPTION 'event_publish_requires_published_session' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER session_events_invariants
  BEFORE INSERT OR UPDATE ON public.session_events
  FOR EACH ROW
  EXECUTE FUNCTION app_private.assert_session_event_invariants();

-- ---------------------------------------------------------------------------
-- Audit (BE-016). Exactly one audit_events row per create or status change.
-- Content edits do not write a row. Handlers must not insert a second row
-- for the same transition. Set app.actor_staff_id (transaction-local) so the
-- row records the staff actor when Prisma bypasses auth.uid().
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.audit_session_event_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_action text;
  v_before text;
  v_after text;
  v_actor_id text;
  v_actor_type public.audit_actor_type;
  v_configured text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'event.create';
    v_before := NULL;
    v_after := NEW.status::text;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_action := 'event.status';
    v_before := OLD.status::text;
    v_after := NEW.status::text;
  ELSE
    RETURN NEW;
  END IF;

  v_configured := NULLIF(current_setting('app.actor_staff_id', true), '');
  IF v_configured IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.staff_members sm WHERE sm.id = v_configured
  ) THEN
    v_actor_id := v_configured;
    v_actor_type := 'STAFF';
  ELSE
    SELECT sm.id INTO v_actor_id
    FROM public.staff_members sm
    WHERE sm."userId" = auth.uid()
      AND sm.status = 'ACTIVE'
      AND sm."isSystem" = false
    LIMIT 1;
    IF v_actor_id IS NOT NULL THEN
      v_actor_type := 'STAFF';
    ELSE
      v_actor_type := 'SYSTEM';
      v_actor_id := app_private.system_staff_id();
    END IF;
  END IF;

  PERFORM app_private.write_audit(
    'session_event',
    NEW.id,
    v_action,
    v_actor_type,
    v_actor_id,
    v_before,
    v_after,
    jsonb_build_object('sessionId', NEW."sessionId")
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER session_events_audit_status
  AFTER INSERT OR UPDATE OF status ON public.session_events
  FOR EACH ROW
  EXECUTE FUNCTION app_private.audit_session_event_status();

REVOKE ALL ON FUNCTION app_private.assert_session_event_invariants() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.audit_session_event_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.assert_session_event_invariants() TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.audit_session_event_status() TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION app_private.assert_session_event_invariants() TO service_role;
    GRANT EXECUTE ON FUNCTION app_private.audit_session_event_status() TO service_role;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- RLS. No anon read. Staff gates use #289 helpers.
-- events.read: select. events.manage: write. Super Admin via allAccess / is_admin().
-- Coach is not granted either key.
-- ---------------------------------------------------------------------------
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.session_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.session_events TO authenticated;

CREATE POLICY session_events_staff_read
  ON public.session_events
  FOR SELECT
  TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'events.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'events.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

CREATE POLICY session_events_staff_write
  ON public.session_events
  FOR ALL
  TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'events.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'events.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

-- Canonical keys consumed by RLS. Front Desk reads; Coach does not.
INSERT INTO public.permission_definitions
  (id, key, category, label, description, sensitive, "createdAt", "updatedAt")
VALUES
  (
    'events.read',
    'events.read',
    'schedule',
    'Read events',
    'View session events, including drafts and internal notes.',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'events.manage',
    'events.manage',
    'schedule',
    'Manage events',
    'Create, edit, publish, cancel, or archive a session event. Does not change session price, capacity, or status.',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (key) DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  sensitive = EXCLUDED.sensitive,
  "updatedAt" = CURRENT_TIMESTAMP;

-- Built-in Front Desk / Coach matrices are trigger-locked (#298).
-- This migration is the canonical expansion, so the guard is paused only for the seed.
ALTER TABLE public.staff_role_permissions DISABLE TRIGGER staff_role_permissions_builtin_guard;

INSERT INTO public.staff_role_permissions (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT
  'role_super_admin:' || p.key,
  'role_super_admin',
  p.id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM public.permission_definitions p
WHERE p.key IN ('events.read', 'events.manage')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO public.staff_role_permissions (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT
  'role_front_desk:events.read',
  'role_front_desk',
  p.id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM public.permission_definitions p
WHERE p.key = 'events.read'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

ALTER TABLE public.staff_role_permissions ENABLE TRIGGER staff_role_permissions_builtin_guard;

NOTIFY pgrst, 'reload schema';

COMMIT;
