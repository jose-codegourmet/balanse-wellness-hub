-- Venues: branches and off-site partner venues. Venue lives on the session.
-- Data-preserving:
--   1. create venue_kind + venues;
--   2. seed the main studio branch (stable id venue-main-studio);
--   3. lift each distinct non-studio session_events."venueName" into an OFFSITE venue
--      and point that event's session at it;
--   4. backfill every other session to the main studio, then enforce NOT NULL + FK;
--   5. drop session_events."venueName" / "venueAddress" (events show their session's venue).
-- Overlapping session times stay allowed. There is no overlap constraint.

BEGIN;

CREATE TYPE "venue_kind" AS ENUM ('BRANCH', 'OFFSITE');

CREATE TABLE "venues" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL DEFAULT '',
  "kind" "venue_kind" NOT NULL DEFAULT 'BRANCH',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "venues_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "venues_name_present" CHECK (char_length(btrim("name")) > 0),
  CONSTRAINT "venues_name_length" CHECK (char_length("name") <= 120),
  CONSTRAINT "venues_address_length" CHECK (char_length("address") <= 240),
  CONSTRAINT "venues_notes_length" CHECK (char_length("notes") <= 1000)
);

CREATE UNIQUE INDEX "venues_name_key" ON "venues"("name");
CREATE INDEX "venues_active_idx" ON "venues"("active");
CREATE INDEX "venues_kind_idx" ON "venues"("kind");

COMMENT ON TABLE "venues" IS
  'Where sessions run: BRANCH (studio the business runs) or OFFSITE (partner venue). Deactivate, do not delete. Staff-only; not in public payloads.';

-- ---------------------------------------------------------------------------
-- Default branch. Address matches CONTACT_DETAILS.address in @balanse/domain.
-- ---------------------------------------------------------------------------
INSERT INTO "venues" ("id", "name", "address", "kind", "active", "notes", "createdAt", "updatedAt")
VALUES (
  'venue-main-studio',
  'Balansé Studio',
  'Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000',
  'BRANCH',
  true,
  '',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------------
-- Off-site venues from existing event venue text. One venue per distinct
-- (case-insensitive, trimmed) name; the most recently edited event supplies the
-- address. Names that mean the studio fold into venue-main-studio.
-- ---------------------------------------------------------------------------
INSERT INTO "venues" ("id", "name", "address", "kind", "active", "notes", "createdAt", "updatedAt")
SELECT
  'venue-offsite-' || substr(md5(src.name_key), 1, 12),
  src.name,
  src.address,
  'OFFSITE',
  true,
  'Created from event venue text by the venues migration.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT ON (lower(left(btrim(e."venueName"), 120)))
    lower(left(btrim(e."venueName"), 120)) AS name_key,
    left(btrim(e."venueName"), 120) AS name,
    left(btrim(e."venueAddress"), 240) AS address
  FROM "session_events" e
  WHERE btrim(e."venueName") <> ''
  ORDER BY lower(left(btrim(e."venueName"), 120)), e."updatedAt" DESC, e."id"
) src
WHERE src.name_key NOT IN (
  'balansé studio',
  'balanse studio',
  'balansé wellness hub',
  'balanse wellness hub'
)
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "sessions" ADD COLUMN "venueId" TEXT;

UPDATE "sessions" s
SET "venueId" = v."id"
FROM "session_events" e
JOIN "venues" v
  ON lower(v."name") = lower(left(btrim(e."venueName"), 120))
WHERE e."sessionId" = s."id"
  AND btrim(e."venueName") <> '';

UPDATE "sessions"
SET "venueId" = 'venue-main-studio'
WHERE "venueId" IS NULL;

ALTER TABLE "sessions" ALTER COLUMN "venueId" SET NOT NULL;

CREATE INDEX "sessions_venueId_idx" ON "sessions"("venueId");

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_venueId_fkey"
  FOREIGN KEY ("venueId") REFERENCES "venues"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Events no longer store venue text; they show their session's venue.
ALTER TABLE "session_events" DROP COLUMN "venueName";
ALTER TABLE "session_events" DROP COLUMN "venueAddress";

-- ---------------------------------------------------------------------------
-- RLS. No anon read (venues are not in public payloads yet).
-- Read: classes.read / classes.manage / schedule.read.all / schedule.read.own /
--       events.read / events.manage (VENUE_READ_PERMISSIONS in @balanse/domain).
-- Write: classes.manage. Super Admin via allAccess / is_admin().
-- No DELETE grant: venues are deactivated, and sessions restrict deletes.
-- ---------------------------------------------------------------------------
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.venues FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.venues TO authenticated;

CREATE POLICY venues_staff_read
  ON public.venues
  FOR SELECT
  TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.manage'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.read.all'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.read.own'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'events.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'events.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

CREATE POLICY venues_staff_insert
  ON public.venues
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

CREATE POLICY venues_staff_update
  ON public.venues
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
