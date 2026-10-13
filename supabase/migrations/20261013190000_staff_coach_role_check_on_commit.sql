-- Staff provisioned with the Coach role together with their coach profile (2026-10-13).
--
-- A coach is always one staff member. `POST /api/admin/staff` with `newCoach` (or an
-- existing `coachId`) inserts the staff row and then links the coach row in the same
-- transaction. The BEFORE INSERT check in `guard_staff_role_invariants` required the
-- coach link to exist before the staff row did, which is impossible because
-- `coaches.staffMemberId` references `staff_members.id` (non-deferrable FK). That
-- made every "new staff with the Coach role" insert fail with
-- `coach_role_requires_linked_coach`.
--
-- The INSERT-time Coach check moves to a DEFERRABLE INITIALLY DEFERRED constraint
-- trigger, so it runs at COMMIT: the transaction still fails if a Coach-role staff
-- member has no coach profile, but the coach row may be linked after the insert.
-- UPDATE (role change) keeps the immediate check; the API links before assigning.

CREATE OR REPLACE FUNCTION app_private.guard_staff_role_invariants()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Coach-role link is verified at COMMIT by staff_members_coach_role_linked.
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
$function$;

CREATE OR REPLACE FUNCTION app_private.assert_new_coach_staff_linked()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Re-read the row at COMMIT: it may have been deleted or re-roled in the same transaction.
  IF EXISTS (
    SELECT 1
    FROM public.staff_members s
    JOIN public.staff_role_definitions r ON r.id = s."roleId"
    WHERE s.id = NEW.id
      AND r.key = 'coach'
      AND NOT EXISTS (SELECT 1 FROM public.coaches c WHERE c."staffMemberId" = s.id)
  ) THEN
    RAISE EXCEPTION 'coach_role_requires_linked_coach' USING ERRCODE = 'P0001';
  END IF;
  RETURN NULL;
END;
$function$;

REVOKE ALL ON FUNCTION app_private.assert_new_coach_staff_linked() FROM PUBLIC;

DROP TRIGGER IF EXISTS staff_members_coach_role_linked ON public.staff_members;
CREATE CONSTRAINT TRIGGER staff_members_coach_role_linked
  AFTER INSERT ON public.staff_members
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION app_private.assert_new_coach_staff_linked();
