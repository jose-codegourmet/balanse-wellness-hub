-- #298 helpers, last-Super-Admin primitive, coach ownership, RLS/RPC gates.
-- CRITICAL: is_admin() stays Super-Admin only. Never "any active staff".

BEGIN;

-- ---------------------------------------------------------------------------
-- Permission + ownership helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.staff_actor_ready(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_uid IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.staff_members sm
    JOIN public.staff_role_definitions rd ON rd.id = sm."roleId"
    WHERE sm."userId" = p_uid
      AND sm.status = 'ACTIVE'
      AND sm."isSystem" = false
      AND rd.status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION app_private.has_permission(p_uid uuid, p_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.staff_actor_ready(p_uid)
     AND EXISTS (
       SELECT 1
       FROM public.staff_members sm
       JOIN public.staff_role_definitions rd ON rd.id = sm."roleId"
       WHERE sm."userId" = p_uid
         AND sm.status = 'ACTIVE'
         AND sm."isSystem" = false
         AND rd.status = 'ACTIVE'
         AND (
           rd."allAccess" = true
           OR EXISTS (
             SELECT 1
             FROM public.staff_role_permissions srp
             JOIN public.permission_definitions pd ON pd.id = srp."permissionId"
             WHERE srp."roleId" = rd.id
               AND pd.key = p_key
           )
         )
     );
$$;

CREATE OR REPLACE FUNCTION app_private.staff_has_permission(p_staff_id text, p_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.has_permission(sm."userId", p_key)
  FROM public.staff_members sm
  WHERE sm.id = p_staff_id;
$$;

CREATE OR REPLACE FUNCTION app_private.linked_coach_id(p_uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.staff_members sm
  JOIN public.coaches c ON c."staffMemberId" = sm.id
  WHERE sm."userId" = p_uid
    AND sm.status = 'ACTIVE'
    AND sm."isSystem" = false
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app_private.staff_linked_coach_id(p_staff_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id
  FROM public.staff_members sm
  JOIN public.coaches c ON c."staffMemberId" = sm.id
  WHERE sm.id = p_staff_id
    AND sm.status = 'ACTIVE'
    AND sm."isSystem" = false
  LIMIT 1;
$$;

-- Own-scope: session_coaches assignment + linked Coach.id. Never names/emails.
CREATE OR REPLACE FUNCTION app_private.owns_session(p_uid uuid, p_session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.linked_coach_id(p_uid) IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM public.session_coaches sc
       WHERE sc."sessionId" = p_session_id
         AND sc."coachId" = app_private.linked_coach_id(p_uid)
     );
$$;

CREATE OR REPLACE FUNCTION app_private.owns_booking_session(p_uid uuid, p_booking_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = p_booking_id
      AND app_private.owns_session(p_uid, b."sessionId")
  );
$$;

CREATE OR REPLACE FUNCTION app_private.has_scoped_permission(
  p_uid uuid,
  p_own_key text,
  p_all_key text,
  p_session_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.has_permission(p_uid, p_all_key)
      OR (
        app_private.has_permission(p_uid, p_own_key)
        AND app_private.owns_session(p_uid, p_session_id)
      );
$$;

CREATE OR REPLACE FUNCTION app_private.assert_permission(p_uid uuid, p_key text)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT app_private.has_permission(p_uid, p_key) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.assert_staff_scoped_permission(
  p_staff_id text,
  p_all_key text,
  p_own_key text,
  p_session_id text
)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT "userId" INTO v_uid FROM public.staff_members WHERE id = p_staff_id;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;
  IF NOT app_private.has_scoped_permission(v_uid, p_own_key, p_all_key, p_session_id) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(p_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.has_permission(auth.uid(), p_key);
$$;

CREATE OR REPLACE FUNCTION public.has_permission(p_uid uuid, p_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.has_permission(COALESCE(p_uid, auth.uid()), p_key);
$$;

CREATE OR REPLACE FUNCTION public.owns_session(p_session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.owns_session(auth.uid(), p_session_id);
$$;

CREATE OR REPLACE FUNCTION public.linked_coach_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.linked_coach_id(auth.uid());
$$;

REVOKE ALL ON FUNCTION app_private.has_permission(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.staff_has_permission(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.linked_coach_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.staff_linked_coach_id(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.owns_session(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.owns_booking_session(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.has_scoped_permission(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.assert_permission(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.assert_staff_scoped_permission(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.staff_actor_ready(uuid) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.linked_coach_id() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_permission(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owns_session(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.linked_coach_id() TO authenticated;

COMMENT ON FUNCTION app_private.has_permission(uuid, text) IS
  '#298 deny-by-default permission check. Super Admin allAccess grants every key. System/disabled/archived deny.';
COMMENT ON FUNCTION app_private.owns_session(uuid, text) IS
  '#298 coach ownership: session_coaches.coachId = linked Coach.id for the signed-in staff member.';

-- ---------------------------------------------------------------------------
-- is_admin() = Super Admin compatibility only (do not broaden)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.is_admin(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members sm
    JOIN public.staff_role_definitions rd ON rd.id = sm."roleId"
    WHERE sm."userId" = p_uid
      AND sm.status = 'ACTIVE'
      AND sm."isSystem" = false
      AND rd.status = 'ACTIVE'
      AND (rd."allAccess" = true OR rd."builtInKey" = 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION app_private.catalogue_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.is_admin(auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Last-Super-Admin concurrency-safe primitive
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.lock_and_count_active_super_admins()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  PERFORM sm.id
  FROM public.staff_members sm
  JOIN public.staff_role_definitions rd ON rd.id = sm."roleId"
  WHERE sm.status = 'ACTIVE'
    AND sm."isSystem" = false
    AND rd.status = 'ACTIVE'
    AND (rd."allAccess" = true OR rd."builtInKey" = 'super_admin')
  FOR UPDATE OF sm;

  SELECT COUNT(*)::integer INTO n
  FROM public.staff_members sm
  JOIN public.staff_role_definitions rd ON rd.id = sm."roleId"
  WHERE sm.status = 'ACTIVE'
    AND sm."isSystem" = false
    AND rd.status = 'ACTIVE'
    AND (rd."allAccess" = true OR rd."builtInKey" = 'super_admin');

  RETURN n;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.assert_last_super_admin_safe(
  p_staff_id text,
  p_action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_super boolean;
  v_count integer;
BEGIN
  IF p_action NOT IN ('disable', 'demote', 'delete', 'strip_all_access') THEN
    RAISE EXCEPTION 'invalid_last_super_admin_action' USING ERRCODE = 'P0001';
  END IF;

  SELECT (rd."allAccess" = true OR rd."builtInKey" = 'super_admin')
    AND sm.status = 'ACTIVE'
    AND sm."isSystem" = false
  INTO v_is_super
  FROM public.staff_members sm
  JOIN public.staff_role_definitions rd ON rd.id = sm."roleId"
  WHERE sm.id = p_staff_id
  FOR UPDATE OF sm;

  IF NOT COALESCE(v_is_super, false) THEN
    RETURN;
  END IF;

  v_count := app_private.lock_and_count_active_super_admins();
  IF v_count <= 1 THEN
    RAISE EXCEPTION 'last_super_admin_protected' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assert_last_super_admin_safe(p_staff_id text, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT app_private.has_permission(auth.uid(), 'staff.manage')
     AND NOT app_private.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;
  PERFORM app_private.assert_last_super_admin_safe(p_staff_id, p_action);
END;
$$;

REVOKE ALL ON FUNCTION app_private.lock_and_count_active_super_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.assert_last_super_admin_safe(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assert_last_super_admin_safe(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assert_last_super_admin_safe(text, text) TO authenticated;

COMMENT ON FUNCTION app_private.assert_last_super_admin_safe(text, text) IS
  '#298 locks active Super Admin staff rows then rejects disable/demote/delete/strip_all_access when only one remains.';

CREATE OR REPLACE FUNCTION app_private.guard_staff_role_invariants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_key text;
  v_new_archived boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."isSystem" THEN
      RAISE EXCEPTION 'system_actor_protected' USING ERRCODE = 'P0001';
    END IF;
    PERFORM app_private.assert_last_super_admin_safe(OLD.id, 'delete');
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT key, status = 'ARCHIVED' INTO v_new_key, v_new_archived
    FROM public.staff_role_definitions
    WHERE id = NEW."roleId";
    IF v_new_key IS NULL THEN
      RAISE EXCEPTION 'role_not_found' USING ERRCODE = 'P0001';
    END IF;
    IF v_new_archived THEN
      RAISE EXCEPTION 'archived_role_cannot_assign' USING ERRCODE = 'P0001';
    END IF;
    IF v_new_key = 'coach' AND NOT EXISTS (
      SELECT 1 FROM public.coaches c WHERE c."staffMemberId" = NEW.id
    ) THEN
      RAISE EXCEPTION 'coach_role_requires_linked_coach' USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW."isSystem" AND TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW."roleId" IS DISTINCT FROM OLD."roleId"
       OR NEW."userId" IS DISTINCT FROM OLD."userId" THEN
      RAISE EXCEPTION 'system_actor_protected' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  SELECT key, status = 'ARCHIVED' INTO v_new_key, v_new_archived
  FROM public.staff_role_definitions
  WHERE id = NEW."roleId";

  IF v_new_key IS NULL THEN
    RAISE EXCEPTION 'role_not_found' USING ERRCODE = 'P0001';
  END IF;
  IF v_new_archived THEN
    RAISE EXCEPTION 'archived_role_cannot_assign' USING ERRCODE = 'P0001';
  END IF;

  IF v_new_key = 'coach' AND NOT EXISTS (
    SELECT 1 FROM public.coaches c WHERE c."staffMemberId" = NEW.id
  ) THEN
    RAISE EXCEPTION 'coach_role_requires_linked_coach' USING ERRCODE = 'P0001';
  END IF;

  IF TG_OP = 'UPDATE' AND NOT NEW."isSystem" THEN
    IF NEW.status = 'DISABLED' AND OLD.status = 'ACTIVE' THEN
      PERFORM app_private.assert_last_super_admin_safe(OLD.id, 'disable');
    END IF;
    IF NEW."roleId" IS DISTINCT FROM OLD."roleId" THEN
      PERFORM app_private.assert_last_super_admin_safe(OLD.id, 'demote');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_members_role_invariants ON public.staff_members;
CREATE TRIGGER staff_members_role_invariants
  BEFORE INSERT OR UPDATE OR DELETE ON public.staff_members
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_staff_role_invariants();

CREATE OR REPLACE FUNCTION app_private.guard_role_definition_invariants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."builtIn" THEN
      RAISE EXCEPTION 'built_in_role_protected' USING ERRCODE = 'P0001';
    END IF;
    IF EXISTS (SELECT 1 FROM public.staff_members WHERE "roleId" = OLD.id) THEN
      RAISE EXCEPTION 'assigned_role_cannot_delete' USING ERRCODE = 'P0001';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD."builtIn" THEN
    IF NEW.key IS DISTINCT FROM OLD.key
       OR NEW."builtIn" IS DISTINCT FROM OLD."builtIn"
       OR NEW."builtInKey" IS DISTINCT FROM OLD."builtInKey"
       OR NEW."allAccess" IS DISTINCT FROM OLD."allAccess"
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'built_in_role_protected' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF NEW.status = 'ARCHIVED' AND OLD.status = 'ACTIVE' THEN
    IF NEW."builtIn" THEN
      RAISE EXCEPTION 'built_in_role_protected' USING ERRCODE = 'P0001';
    END IF;
    IF EXISTS (SELECT 1 FROM public.staff_members WHERE "roleId" = NEW.id) THEN
      RAISE EXCEPTION 'assigned_role_cannot_archive' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF NEW."allAccess" IS DISTINCT FROM OLD."allAccess" AND OLD."allAccess" = true THEN
    IF EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm."roleId" = OLD.id AND sm.status = 'ACTIVE' AND sm."isSystem" = false
    ) THEN
      PERFORM app_private.lock_and_count_active_super_admins();
      IF app_private.lock_and_count_active_super_admins() <= 1 THEN
        RAISE EXCEPTION 'last_super_admin_protected' USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_role_definitions_invariants ON public.staff_role_definitions;
CREATE TRIGGER staff_role_definitions_invariants
  BEFORE UPDATE OR DELETE ON public.staff_role_definitions
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_role_definition_invariants();

CREATE OR REPLACE FUNCTION app_private.guard_built_in_role_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.staff_role_definitions%ROWTYPE;
  v_role_id text;
BEGIN
  v_role_id := COALESCE(NEW."roleId", OLD."roleId");
  SELECT * INTO v_role FROM public.staff_role_definitions WHERE id = v_role_id;
  IF v_role."builtIn" AND v_role."builtInKey" IN ('front_desk', 'coach') THEN
    RAISE EXCEPTION 'built_in_role_matrix_protected' USING ERRCODE = 'P0001';
  END IF;
  IF v_role."builtIn" AND v_role."builtInKey" = 'super_admin' AND TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'built_in_role_matrix_protected' USING ERRCODE = 'P0001';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS staff_role_permissions_builtin_guard ON public.staff_role_permissions;
CREATE TRIGGER staff_role_permissions_builtin_guard
  BEFORE INSERT OR UPDATE OR DELETE ON public.staff_role_permissions
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_built_in_role_permissions();

-- ---------------------------------------------------------------------------
-- Attendance / catalogue RPC authorization
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_in_booking(p_booking_id text, p_actor_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status "booking_status";
  v_session text;
BEGIN
  SELECT status, "sessionId" INTO v_status, v_session
  FROM bookings WHERE id = p_booking_id FOR UPDATE;
  PERFORM app_private.assert_staff_scoped_permission(
    p_actor_id, 'attendance.manage.all', 'attendance.manage.own', v_session
  );
  IF v_status <> 'CONFIRMED' THEN
    RAISE EXCEPTION 'check_in_requires_confirmed' USING ERRCODE = 'P0001';
  END IF;
  UPDATE bookings
    SET "checkedInAt" = clock_timestamp(),
        "checkedInById" = p_actor_id,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;
  PERFORM public.transition_booking(
    p_booking_id, 'CHECKED_IN', 'STAFF', p_actor_id, 'booking.check_in', '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_no_show(p_booking_id text, p_actor_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status "booking_status";
  v_session text;
BEGIN
  SELECT status, "sessionId" INTO v_status, v_session
  FROM bookings WHERE id = p_booking_id FOR UPDATE;
  PERFORM app_private.assert_staff_scoped_permission(
    p_actor_id, 'attendance.manage.all', 'attendance.manage.own', v_session
  );
  IF v_status <> 'CONFIRMED' THEN
    RAISE EXCEPTION 'no_show_requires_confirmed' USING ERRCODE = 'P0001';
  END IF;
  UPDATE bookings
    SET "noShowMarkedAt" = clock_timestamp(),
        "noShowMarkedById" = p_actor_id,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;
  PERFORM public.transition_booking(
    p_booking_id, 'NO_SHOW', 'STAFF', p_actor_id, 'booking.no_show', '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION app_private.restrict_customer_booking_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF app_private.has_permission(auth.uid(), 'attendance.manage.all')
     OR (
       app_private.has_permission(auth.uid(), 'attendance.manage.own')
       AND app_private.owns_session(auth.uid(), NEW."sessionId")
     ) THEN
    IF NEW."sessionId" IS DISTINCT FROM OLD."sessionId"
       OR NEW."holdExpiresAt" IS DISTINCT FROM OLD."holdExpiresAt"
       OR NEW."profileId" IS DISTINCT FROM OLD."profileId" THEN
      RAISE EXCEPTION 'customer_cannot_write_capacity_or_terminal_status' USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
  END IF;
  IF app_private.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW."sessionId" IS DISTINCT FROM OLD."sessionId"
    OR NEW."holdExpiresAt" IS DISTINCT FROM OLD."holdExpiresAt"
    OR NEW."profileId" IS DISTINCT FROM OLD."profileId"
    OR NEW.status IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW', 'REJECTED', 'EXPIRED')
  THEN
    RAISE EXCEPTION 'customer_cannot_write_capacity_or_terminal_status' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_class_catalogue(payload jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE target_id text; coach_ids text[]; assigned_id text;
BEGIN
 IF NOT app_private.has_permission(auth.uid(), 'classes.manage') THEN
  RAISE EXCEPTION 'permission_denied' USING ERRCODE='42501';
 END IF;
 target_id := COALESCE(NULLIF(payload->>'id',''),gen_random_uuid()::text);
 SELECT COALESCE(array_agg(value),'{}') INTO coach_ids FROM jsonb_array_elements_text(COALESCE(payload->'coachIds','[]'::jsonb));
 IF cardinality(coach_ids)>100 OR cardinality(coach_ids)<>(SELECT count(DISTINCT x) FROM unnest(coach_ids) x) THEN RAISE EXCEPTION 'Invalid coach selection'; END IF;
 IF length(trim(payload->>'name')) NOT BETWEEN 1 AND 80 OR length(payload->>'shortDescription') NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Invalid class name or description'; END IF;
 IF payload->>'id' IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.classes WHERE id=target_id) THEN RAISE EXCEPTION 'Class not found'; END IF;
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
END;
$$;

-- Report RPCs stay revoked from Data API; deny if a future GRANT appears.
CREATE OR REPLACE FUNCTION app_private.assert_report_permission(p_key text)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prisma/service-role has no JWT; handlers must authorize (#292). Data API execute stays revoked.
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  PERFORM app_private.assert_permission(auth.uid(), p_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.report_sales_overview(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE ("grossSales" numeric, "refunds" numeric, "netSales" numeric, "paidBookings" integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.sales.read');
  RETURN QUERY
  WITH scoped AS (
    SELECT s.id, s."customerPrice"
    FROM sessions s
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  ),
  paid AS (
    SELECT b.id, s."customerPrice"
    FROM bookings b
    JOIN scoped s ON s.id = b."sessionId"
    WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
  )
  SELECT
    COALESCE((SELECT SUM("customerPrice") FROM paid), 0),
    COALESCE((
      SELECT SUM(r.amount) FROM refunds r
      JOIN bookings b ON b.id = r."bookingId"
      JOIN scoped s ON s.id = b."sessionId"
      WHERE r.status = 'REFUNDED'
    ), 0),
    COALESCE((SELECT SUM("customerPrice") FROM paid), 0) - COALESCE((
      SELECT SUM(r.amount) FROM refunds r
      JOIN bookings b ON b.id = r."bookingId"
      JOIN scoped s ON s.id = b."sessionId"
      WHERE r.status = 'REFUNDED'
    ), 0),
    COALESCE((SELECT COUNT(*)::integer FROM paid), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.report_class_performance_v2(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE ("className" text, sessions integer, revenue numeric, occupancy numeric, "noShows" integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.capacity.read');
  RETURN QUERY
  WITH scoped AS (
    SELECT s.*
    FROM sessions s
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  ),
  per_session AS (
    SELECT
      s.id, s."classId", s.capacity, s."customerPrice",
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) AS paid,
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED')) AS confirmed,
      COUNT(*) FILTER (WHERE b.status = 'NO_SHOW') AS no_shows
    FROM scoped s
    LEFT JOIN bookings b ON b."sessionId" = s.id
    GROUP BY s.id, s."classId", s.capacity, s."customerPrice"
  )
  SELECT
    c.name, COUNT(ps.id)::integer, COALESCE(SUM(ps.paid * ps."customerPrice"), 0),
    CASE WHEN SUM(ps.capacity) = 0 THEN 0 ELSE SUM(ps.confirmed)::numeric / SUM(ps.capacity) END,
    SUM(ps.no_shows)::integer
  FROM per_session ps
  JOIN classes c ON c.id = ps."classId"
  GROUP BY c.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_coach_costs(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status public.session_status DEFAULT NULL
)
RETURNS TABLE ("coachName" text, sessions integer, "coachCost" numeric, "relatedRevenue" numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.coach_costs.read');
  RETURN QUERY
  WITH per_session AS (
    SELECT s.id, s."startsAt", s."endsAt",
      COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice" AS revenue
    FROM public.sessions s LEFT JOIN public.bookings b ON b."sessionId" = s.id
    WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
    GROUP BY s.id
  )
  SELECT co.name, COUNT(ps.id)::integer,
    SUM(ROUND(sc."coachRate" * CASE WHEN sc."coachRateType" = 'PER_HOUR'
      THEN EXTRACT(EPOCH FROM (ps."endsAt" - ps."startsAt")) / 3600 ELSE 1 END, 2)),
    COALESCE(SUM(ps.revenue), 0)
  FROM per_session ps
  JOIN public.session_coaches sc ON sc."sessionId" = ps.id
  JOIN public.coaches co ON co.id = sc."coachId"
  WHERE p_coach_id IS NULL OR sc."coachId" = p_coach_id
  GROUP BY co.id, co.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.report_session_performance(
  p_from timestamptz, p_to timestamptz, p_class_id text DEFAULT NULL,
  p_coach_id text DEFAULT NULL, p_session_status "session_status" DEFAULT NULL
)
RETURNS TABLE (
  "startsAt" timestamptz, "className" text, capacity integer, confirmed integer,
  revenue numeric, "coachCost" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.session.read');
  RETURN QUERY
  SELECT
    s."startsAt", c.name, s.capacity,
    COUNT(*) FILTER (
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED')
    )::integer,
    COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice",
    app_private.session_coach_cost(s.id)
  FROM sessions s
  JOIN classes c ON c.id = s."classId"
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE app_private.session_matches_report_filters(s, p_from, p_to, p_class_id, p_coach_id, p_session_status)
  GROUP BY s.id, s."startsAt", c.name, s.capacity, s."customerPrice", app_private.session_coach_cost(s.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.report_session_drilldown(p_session_id text)
RETURNS TABLE (
  capacity integer, confirmed integer, held integer, available integer, waitlisted integer,
  "checkedIn" integer, "noShow" integer, "customerPrice" numeric, "grossRevenue" numeric,
  refunds numeric, "coachCost" numeric, "grossContribution" numeric, occupancy numeric,
  "attendanceUtilisation" numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM app_private.assert_report_permission('reports.session.read');
  RETURN QUERY
  SELECT
    s.capacity,
    COUNT(*) FILTER (
      WHERE b.status IN ('CONFIRMED', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN')
    )::integer,
    COUNT(*) FILTER (
      WHERE b.status IN ('HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED')
    )::integer,
    GREATEST(s.capacity - app_private.session_consumed_capacity(s.id), 0),
    (SELECT COUNT(*)::integer FROM waitlist_entries w WHERE w."sessionId" = s.id AND w.status = 'WAITING'),
    COUNT(*) FILTER (WHERE b.status = 'CHECKED_IN')::integer,
    COUNT(*) FILTER (WHERE b.status = 'NO_SHOW')::integer,
    s."customerPrice",
    COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice",
    COALESCE((
      SELECT SUM(r.amount) FROM refunds r
      JOIN bookings b2 ON b2.id = r."bookingId"
      WHERE b2."sessionId" = s.id AND r.status = 'REFUNDED'
    ), 0),
    app_private.session_coach_cost(s.id),
    (COUNT(*) FILTER (WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')) * s."customerPrice") - app_private.session_coach_cost(s.id),
    CASE WHEN s.capacity = 0 THEN 0
      ELSE COUNT(*) FILTER (
        WHERE b.status IN ('CONFIRMED', 'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN')
      )::numeric / s.capacity END,
    CASE WHEN s.capacity = 0 THEN 0
      ELSE COUNT(*) FILTER (WHERE b.status = 'CHECKED_IN')::numeric / s.capacity END
  FROM sessions s
  LEFT JOIN bookings b ON b."sessionId" = s.id
  WHERE s.id = p_session_id
  GROUP BY s.id;
END;
$$;

REVOKE ALL ON FUNCTION public.report_sales_overview(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_class_performance_v2(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_coach_costs(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_session_performance(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_session_drilldown(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.report_class_performance(timestamptz, timestamptz, text, text, session_status) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS: new tables + least-privilege staff policies. Public/customer intact.
-- ---------------------------------------------------------------------------
ALTER TABLE public.staff_role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_role_permissions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.staff_role_definitions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.permission_definitions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.staff_role_permissions FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_role_definitions TO authenticated;
GRANT SELECT ON public.permission_definitions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_role_permissions TO authenticated;
GRANT SELECT("roleId") ON public.staff_members TO authenticated;

CREATE POLICY role_definitions_read ON public.staff_role_definitions
  FOR SELECT TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'roles.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'staff.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage'))
  );

CREATE POLICY role_definitions_write ON public.staff_role_definitions
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage')))
  WITH CHECK ((SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage')));

CREATE POLICY permission_definitions_read ON public.permission_definitions
  FOR SELECT TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'roles.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'staff.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage'))
  );

CREATE POLICY role_permissions_read ON public.staff_role_permissions
  FOR SELECT TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'roles.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'staff.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage'))
  );

CREATE POLICY role_permissions_write ON public.staff_role_permissions
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage')))
  WITH CHECK ((SELECT app_private.has_permission((SELECT auth.uid()), 'roles.manage')));

-- Staff directory: Super Admin / staff.* only. Front Desk and Coach stay out.
DROP POLICY IF EXISTS staff_admin_all ON public.staff_members;
CREATE POLICY staff_admin_select ON public.staff_members
  FOR SELECT TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'staff.read')));
CREATE POLICY staff_admin_write ON public.staff_members
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'staff.manage')))
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'staff.manage'))
    AND "isSystem" = false
  );

-- Operational schedule / roster (Front Desk all-scope, Coach own-scope).
DROP POLICY IF EXISTS sessions_public_read ON public.sessions;
CREATE POLICY sessions_public_read ON public.sessions
  FOR SELECT TO anon, authenticated
  USING (
    status = 'PUBLISHED'
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.read.all'))
    OR (
      (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.read.own'))
      AND (SELECT app_private.owns_session((SELECT auth.uid()), id))
    )
  );

DROP POLICY IF EXISTS sessions_admin_write ON public.sessions;
CREATE POLICY sessions_admin_write ON public.sessions
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.create'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.update'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.cancel'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.create'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.update'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.cancel'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS session_recurrence_rules_admin_all ON public.session_recurrence_rules;
CREATE POLICY session_recurrence_rules_admin_all
  ON public.session_recurrence_rules
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.recurrence.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.recurrence.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

-- session_coaches contains rate snapshots — no Front Desk/Coach SELECT.
DROP POLICY IF EXISTS session_coaches_admin_all ON public.session_coaches;
CREATE POLICY session_coaches_rate_select ON public.session_coaches
  FOR SELECT TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'coach_rates.read'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );
CREATE POLICY session_coaches_write ON public.session_coaches
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.create'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.update'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'coach_rates.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.create'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'schedule.update'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'coach_rates.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS bookings_self_select ON public.bookings;
CREATE POLICY bookings_self_select ON public.bookings
  FOR SELECT TO authenticated
  USING (
    "profileId" = (SELECT auth.uid())
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'roster.read.all'))
    OR (
      (SELECT app_private.has_permission((SELECT auth.uid()), 'roster.read.own'))
      AND (SELECT app_private.owns_session((SELECT auth.uid()), "sessionId"))
    )
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS bookings_admin_all ON public.bookings;
CREATE POLICY bookings_admin_all ON public.bookings
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.confirm'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.reject'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'attendance.manage.all'))
    OR (
      (SELECT app_private.has_permission((SELECT auth.uid()), 'attendance.manage.own'))
      AND (SELECT app_private.owns_session((SELECT auth.uid()), "sessionId"))
    )
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.confirm'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.reject'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'attendance.manage.all'))
    OR (
      (SELECT app_private.has_permission((SELECT auth.uid()), 'attendance.manage.own'))
      AND (SELECT app_private.owns_session((SELECT auth.uid()), "sessionId"))
    )
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'customers.read'))
    OR (
      (SELECT app_private.has_permission((SELECT auth.uid()), 'roster.read.own'))
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b."profileId" = id
          AND (SELECT app_private.owns_session((SELECT auth.uid()), b."sessionId"))
      )
    )
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS payments_admin_all ON public.payments;
CREATE POLICY payments_admin_all ON public.payments
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.review'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.record_cash'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.review'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.record_cash'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS refunds_admin_all ON public.refunds;
CREATE POLICY refunds_admin_all ON public.refunds
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'refunds.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'refunds.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'refunds.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS waitlist_admin_all ON public.waitlist_entries;
CREATE POLICY waitlist_admin_all ON public.waitlist_entries
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'roster.read.all'))
    OR (
      (SELECT app_private.has_permission((SELECT auth.uid()), 'roster.read.own'))
      AND (SELECT app_private.owns_session((SELECT auth.uid()), "sessionId"))
    )
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bookings.confirm'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS cancellation_admin_all ON public.cancellation_requests;
CREATE POLICY cancellation_admin_all ON public.cancellation_requests
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'cancellations.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'cancellations.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'cancellations.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS reschedule_admin_all ON public.reschedule_requests;
CREATE POLICY reschedule_admin_all ON public.reschedule_requests
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'reschedules.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'reschedules.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'reschedules.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS coaches_admin_all ON public.coaches;
CREATE POLICY coaches_admin_write ON public.coaches
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'coaches.manage'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'coach_rates.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'coaches.manage'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'coach_rates.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS classes_admin_write ON public.classes;
CREATE POLICY classes_admin_write ON public.classes
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'classes.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS policies_admin_write ON public.policy_documents;
CREATE POLICY policies_admin_write ON public.policy_documents
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.policies.manage')))
  WITH CHECK ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.policies.manage')));

DROP POLICY IF EXISTS policy_versions_admin_write ON public.policy_document_versions;
CREATE POLICY policy_versions_admin_write ON public.policy_document_versions
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.policies.manage')))
  WITH CHECK ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.policies.manage')));

DROP POLICY IF EXISTS faqs_admin_write ON public.faqs;
CREATE POLICY faqs_admin_write ON public.faqs
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.content.manage')))
  WITH CHECK ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.content.manage')));

DROP POLICY IF EXISTS payment_qr_codes_admin_all ON public.payment_qr_codes;
CREATE POLICY payment_qr_codes_admin_all ON public.payment_qr_codes
  FOR ALL TO authenticated
  USING ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.payment_qr.manage')))
  WITH CHECK ((SELECT app_private.has_permission((SELECT auth.uid()), 'settings.payment_qr.manage')));

DROP POLICY IF EXISTS audit_admin_select ON public.audit_events;
CREATE POLICY audit_admin_select ON public.audit_events
  FOR SELECT TO authenticated
  USING ((SELECT app_private.is_admin((SELECT auth.uid()))));

DROP POLICY IF EXISTS pending_uploads_admin_all ON public.pending_uploads;
CREATE POLICY pending_uploads_admin_all ON public.pending_uploads
  FOR ALL TO authenticated
  USING ((SELECT app_private.is_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT app_private.is_admin((SELECT auth.uid()))));

DROP POLICY IF EXISTS bundles_public_read ON public.bundles;
CREATE POLICY bundles_public_read ON public.bundles
  FOR SELECT TO anon, authenticated
  USING (
    status = 'PUBLISHED'
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.read'))
    OR (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS bundles_admin_write ON public.bundles;
CREATE POLICY bundles_admin_write ON public.bundles
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS bundle_class_admin_write ON public.bundle_class_applicability;
CREATE POLICY bundle_class_admin_write ON public.bundle_class_applicability
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS customer_bundles_admin_write ON public.customer_bundles;
CREATE POLICY customer_bundles_admin_write ON public.customer_bundles
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DROP POLICY IF EXISTS bundle_redemptions_admin_write ON public.bundle_redemptions;
CREATE POLICY bundle_redemptions_admin_write ON public.bundle_redemptions
  FOR ALL TO authenticated
  USING (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT app_private.has_permission((SELECT auth.uid()), 'bundles.manage'))
    OR (SELECT app_private.is_admin((SELECT auth.uid())))
  );

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects missing — skip #298 storage policy updates.';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS payment_proofs_admin_all ON storage.objects;
  CREATE POLICY payment_proofs_admin_all ON storage.objects
    FOR ALL TO authenticated
    USING (
      bucket_id = 'payment-proofs'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.read'))
        OR (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.review'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    )
    WITH CHECK (
      bucket_id = 'payment-proofs'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'payments.review'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    );

  DROP POLICY IF EXISTS coach_photos_admin_write ON storage.objects;
  CREATE POLICY coach_photos_admin_write ON storage.objects
    FOR ALL TO authenticated
    USING (
      bucket_id = 'coach-photos'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'coaches.manage'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    )
    WITH CHECK (
      bucket_id = 'coach-photos'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'coaches.manage'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    );

  DROP POLICY IF EXISTS marketing_assets_admin_write ON storage.objects;
  CREATE POLICY marketing_assets_admin_write ON storage.objects
    FOR ALL TO authenticated
    USING (
      bucket_id = 'marketing-assets'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'settings.content.manage'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    )
    WITH CHECK (
      bucket_id = 'marketing-assets'
      AND (
        (SELECT app_private.has_permission((SELECT auth.uid()), 'settings.content.manage'))
        OR (SELECT app_private.is_admin((SELECT auth.uid())))
      )
    );
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
