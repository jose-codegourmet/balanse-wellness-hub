-- #345 Public read surface (depends on #344 profile identity columns).
--   app_public.public_session(p_session_id)        published/cancelled session facts
--   app_public.public_event(p_event_id)            published/cancelled event + session facts
--   app_public.public_session_roster(p_session_id) counts for anon; display-only rows
--                                                  for authenticated callers
-- SECURITY DEFINER, STABLE, search_path pinned to ''. Tables stay closed to anon;
-- these functions are the only public path to events, venues, and attendee identity.
-- Never returned: venue notes, event internalNotes / isPlaceholder, lastName, email,
-- contactNumber, profileId, bookingId, booking/payment status, reservation time.
-- No slug columns: class slug comes from classes.slug; the event slug is derived from
-- the title at render time.

BEGIN;

CREATE SCHEMA IF NOT EXISTS app_public;
REVOKE ALL ON SCHEMA app_public FROM PUBLIC;
GRANT USAGE ON SCHEMA app_public TO anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA app_public TO service_role;
  END IF;
END $$;

COMMENT ON SCHEMA app_public IS
  '#345 public read functions (SECURITY DEFINER). Only privacy-reviewed projections live here.';

-- ---------------------------------------------------------------------------
-- Published session read. DRAFT returns no row.
-- remaining_slots = GREATEST(capacity - session_consumed_capacity, 0) (BE-017; held
-- bookings still consume capacity). occurrence_title is reserved: sessions have no
-- title column yet, so it is always NULL (the UI falls back to the class name).
-- The linked event is returned only when PUBLISHED or CANCELLED; its status is
-- CANCELLED whenever the session is CANCELLED (events.md R3).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_public.public_session(p_session_id text)
RETURNS TABLE (
  session_id text,
  class_id text,
  class_name text,
  class_slug text,
  occurrence_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  remaining_slots integer,
  customer_price numeric,
  status public.session_status,
  venue_name text,
  venue_address text,
  coaches jsonb,
  event_id text,
  event_title text,
  event_status public.event_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    s.id,
    c.id,
    c.name,
    c.slug,
    NULL::text,
    s."startsAt",
    s."endsAt",
    s.capacity,
    GREATEST(s.capacity - app_private.session_consumed_capacity(s.id), 0),
    s."customerPrice",
    s.status,
    v.name,
    v.address,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', co.id,
          'name', co.name,
          'specialties', to_jsonb(co.specialties),
          'photoKey', co."photoKey"
        )
        ORDER BY sc."createdAt", co.name, co.id
      )
      FROM public.session_coaches sc
      JOIN public.coaches co ON co.id = sc."coachId"
      WHERE sc."sessionId" = s.id
    ), '[]'::jsonb),
    e.id,
    e.title,
    CASE
      WHEN e.id IS NULL THEN NULL
      WHEN s.status = 'CANCELLED' THEN 'CANCELLED'::public.event_status
      ELSE e.status
    END
  FROM public.sessions s
  JOIN public.classes c ON c.id = s."classId"
  JOIN public.venues v ON v.id = s."venueId"
  LEFT JOIN public.session_events e
    ON e."sessionId" = s.id
   AND e.status IN ('PUBLISHED', 'CANCELLED')
  WHERE s.id = p_session_id
    AND s.status IN ('PUBLISHED', 'CANCELLED');
$$;

COMMENT ON FUNCTION app_public.public_session(text) IS
  '#345 public session read. PUBLISHED/CANCELLED only. Venue name/address only (never notes). Coaches: id, name, specialties, photoKey.';

-- ---------------------------------------------------------------------------
-- Published event read. DRAFT / ARCHIVED return no row, and so does an event whose
-- session is not PUBLISHED/CANCELLED. Effective status is CANCELLED when the session
-- is CANCELLED. Never internalNotes or isPlaceholder.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_public.public_event(p_event_id text)
RETURNS TABLE (
  event_id text,
  title text,
  summary text,
  description text,
  poster_image text,
  gallery_images text[],
  beneficiary text,
  what_to_bring text,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  status public.event_status,
  session_id text,
  class_id text,
  class_name text,
  class_slug text,
  occurrence_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer,
  remaining_slots integer,
  customer_price numeric,
  session_status public.session_status,
  venue_name text,
  venue_address text,
  coaches jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    e.id,
    e.title,
    e.summary,
    e.description,
    e."posterImage",
    e."galleryImages",
    e.beneficiary,
    e."whatToBring",
    e."registrationOpensAt",
    e."registrationClosesAt",
    CASE WHEN ps.status = 'CANCELLED' THEN 'CANCELLED'::public.event_status ELSE e.status END,
    ps.session_id,
    ps.class_id,
    ps.class_name,
    ps.class_slug,
    ps.occurrence_title,
    ps.starts_at,
    ps.ends_at,
    ps.capacity,
    ps.remaining_slots,
    ps.customer_price,
    ps.status,
    ps.venue_name,
    ps.venue_address,
    ps.coaches
  FROM public.session_events e
  CROSS JOIN LATERAL app_public.public_session(e."sessionId") ps
  WHERE e.id = p_event_id
    AND e.status IN ('PUBLISHED', 'CANCELLED');
$$;

COMMENT ON FUNCTION app_public.public_event(text) IS
  '#345 public event read. PUBLISHED/CANCELLED only (session CANCELLED forces CANCELLED). Never internalNotes or isPlaceholder.';

-- ---------------------------------------------------------------------------
-- Public roster. One row, or none when the session is not PUBLISHED/CANCELLED.
--   going_count  CONFIRMED + CHECKED_IN bookings (opted-out included)
--   spots_left   GREATEST(capacity - session_consumed_capacity, 0)
--   anon (auth.uid() IS NULL): hidden_count = 0, attendees = []
--   authenticated (customers, staff, admins alike):
--     attendees    CONFIRMED/CHECKED_IN rows with showOnPublicRoster = true, plus the
--                  viewer's own row even when opted out ("only you can see this")
--     hidden_count opted-out going attendees, excluding the viewer
--   attendee keys: row_key (sha256 of booking id + session id, truncated; opaque),
--                  display_name (nickname, else firstName), avatar_key (nullable),
--                  initials (first letters of firstName + lastName), is_self.
--   Ordered by checkedInAt, then reservedAt (neither is returned).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_public.public_session_roster(p_session_id text)
RETURNS TABLE (
  going_count integer,
  spots_left integer,
  hidden_count integer,
  attendees jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH viewer AS (
    SELECT auth.uid() AS uid
  ),
  target AS (
    SELECT s.id, s.capacity
    FROM public.sessions s
    WHERE s.id = p_session_id
      AND s.status IN ('PUBLISHED', 'CANCELLED')
  ),
  going AS (
    SELECT
      b.id AS booking_id,
      b."profileId" AS profile_id,
      b."checkedInAt" AS checked_in_at,
      b."reservedAt" AS reserved_at,
      p."firstName" AS first_name,
      p."lastName" AS last_name,
      p.nickname,
      p."avatarKey" AS avatar_key,
      p."showOnPublicRoster" AS show_on_roster
    FROM target t
    JOIN public.bookings b
      ON b."sessionId" = t.id
     AND b.status IN ('CONFIRMED', 'CHECKED_IN')
    JOIN public.profiles p ON p.id = b."profileId"
  ),
  listed AS (
    SELECT
      left(encode(sha256(convert_to(g.booking_id || ':' || t.id, 'UTF8')), 'hex'), 24) AS row_key,
      COALESCE(NULLIF(btrim(g.nickname), ''), btrim(g.first_name)) AS display_name,
      g.avatar_key,
      upper(left(btrim(g.first_name), 1) || left(btrim(g.last_name), 1)) AS initials,
      (g.profile_id = v.uid) AS is_self,
      g.checked_in_at,
      g.reserved_at
    FROM going g
    CROSS JOIN target t
    CROSS JOIN viewer v
    WHERE v.uid IS NOT NULL
      AND (g.show_on_roster OR g.profile_id = v.uid)
  )
  SELECT
    (SELECT count(*)::integer FROM going),
    GREATEST(t.capacity - app_private.session_consumed_capacity(t.id), 0),
    CASE
      WHEN v.uid IS NULL THEN 0
      ELSE (
        SELECT count(*)::integer
        FROM going g
        WHERE NOT g.show_on_roster
          AND g.profile_id <> v.uid
      )
    END,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'row_key', l.row_key,
          'display_name', l.display_name,
          'avatar_key', l.avatar_key,
          'initials', l.initials,
          'is_self', l.is_self
        )
        ORDER BY l.checked_in_at ASC NULLS LAST, l.reserved_at ASC, l.row_key
      )
      FROM listed l
    ), '[]'::jsonb)
  FROM target t
  CROSS JOIN viewer v;
$$;

COMMENT ON FUNCTION app_public.public_session_roster(text) IS
  '#345 public roster. anon: counts only. authenticated: display-only rows (row_key, display_name, avatar_key, initials, is_self); opted-out hidden from others, returned to self. Never lastName/email/contact/ids/status/reservation time.';

-- ---------------------------------------------------------------------------
-- Grants. EXECUTE to anon + authenticated only.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION app_public.public_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_public.public_event(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_public.public_session_roster(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_public.public_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_public.public_event(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_public.public_session_roster(text) TO anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION app_public.public_session(text) TO service_role;
    GRANT EXECUTE ON FUNCTION app_public.public_event(text) TO service_role;
    GRANT EXECUTE ON FUNCTION app_public.public_session_roster(text) TO service_role;
  END IF;
END $$;

-- Tables behind the public surface stay closed to anon (idempotent re-assertion).
-- sessions / classes / coaches keep their existing catalogue grants (BE-020, class catalogue).
REVOKE ALL ON TABLE public.session_events FROM anon;
REVOKE ALL ON TABLE public.venues FROM anon;
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.bookings FROM anon;
REVOKE ALL ON TABLE public.session_coaches FROM anon;
REVOKE ALL ON TABLE public.profile_onboarding FROM anon;
REVOKE ALL ON TABLE public.profile_class_interests FROM anon;

NOTIFY pgrst, 'reload schema';

COMMIT;
