-- WIRE-0401 (#361): session occurrence title and bookability.
ALTER TABLE "public"."sessions"
  ADD COLUMN "name" VARCHAR(120),
  ADD COLUMN "bookable" BOOLEAN NOT NULL DEFAULT true;

-- app_public.public_session previously hard-coded occurrence_title as NULL
-- and did not expose bookable. The column list changed, so Postgres needs
-- the function dropped first; everything else is unchanged from the
-- function this replaces (be345_create_public_read_functions).
DROP FUNCTION app_public.public_session(text);

CREATE FUNCTION app_public.public_session(p_session_id text)
 RETURNS TABLE(session_id text, class_id text, class_name text, class_slug text, occurrence_title text, starts_at timestamp with time zone, ends_at timestamp with time zone, capacity integer, remaining_slots integer, customer_price numeric, status session_status, bookable boolean, venue_name text, venue_address text, coaches jsonb, event_id text, event_title text, event_status event_status)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT
    s.id,
    c.id,
    c.name,
    c.slug,
    s.name,
    s."startsAt",
    s."endsAt",
    s.capacity,
    GREATEST(s.capacity - app_private.session_consumed_capacity(s.id), 0),
    s."customerPrice",
    s.status,
    s.bookable,
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
$function$;

GRANT EXECUTE ON FUNCTION app_public.public_session(text) TO anon, authenticated;
