-- WIRE-2001. API writes use the server's database connection; direct Data API
-- access is read-only and filtered by staff permission or request ownership.
BEGIN;

CREATE TYPE public.class_change_kind AS ENUM ('RESCHEDULE', 'SUBSTITUTE', 'CANCEL');
CREATE TYPE public.class_change_status AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN');

CREATE TABLE public.class_change_requests (
  id text PRIMARY KEY,
  "sessionId" text NOT NULL REFERENCES public.sessions(id) ON DELETE RESTRICT,
  kind public.class_change_kind NOT NULL,
  status public.class_change_status NOT NULL DEFAULT 'PENDING',
  reason varchar(500) NOT NULL,
  "requestedByStaffId" text NOT NULL REFERENCES public.staff_members(id) ON DELETE RESTRICT,
  "requestedByCoachId" text NOT NULL REFERENCES public.coaches(id) ON DELETE RESTRICT,
  "sessionClassName" text NOT NULL,
  "sessionStartsAt" timestamptz NOT NULL,
  "sessionEndsAt" timestamptz NOT NULL,
  "sessionCoachName" text NOT NULL,
  "proposedStartsAt" timestamptz,
  "proposedEndsAt" timestamptz,
  "substituteCoachId" text REFERENCES public.coaches(id) ON DELETE SET NULL,
  "reviewedByStaffId" text REFERENCES public.staff_members(id) ON DELETE SET NULL,
  "reviewedAt" timestamptz,
  "decisionNote" varchar(500),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_change_reason_length CHECK (char_length(btrim(reason)) BETWEEN 10 AND 500),
  CONSTRAINT class_change_window CHECK (
    (kind = 'RESCHEDULE' AND "proposedStartsAt" IS NOT NULL
      AND "proposedEndsAt" > "proposedStartsAt" AND "substituteCoachId" IS NULL)
    OR (kind = 'SUBSTITUTE' AND "substituteCoachId" IS NOT NULL
      AND "proposedStartsAt" IS NULL AND "proposedEndsAt" IS NULL)
    OR (kind = 'CANCEL' AND "substituteCoachId" IS NULL
      AND "proposedStartsAt" IS NULL AND "proposedEndsAt" IS NULL)
  ),
  CONSTRAINT class_change_review_state CHECK (
    (status = 'PENDING' AND "reviewedAt" IS NULL AND "reviewedByStaffId" IS NULL)
    OR (status = 'WITHDRAWN' AND "reviewedAt" IS NOT NULL AND "reviewedByStaffId" IS NULL)
    OR (status IN ('APPROVED', 'DENIED') AND "reviewedAt" IS NOT NULL
      AND "reviewedByStaffId" IS NOT NULL)
  ),
  CONSTRAINT class_change_deny_note CHECK (
    status <> 'DENIED' OR char_length(btrim(coalesce("decisionNote", ''))) > 0
  )
);

CREATE INDEX class_change_requests_sessionId_status_idx
  ON public.class_change_requests ("sessionId", status);
CREATE INDEX class_change_requests_requestedByStaffId_createdAt_idx
  ON public.class_change_requests ("requestedByStaffId", "createdAt");
CREATE INDEX class_change_requests_requestedByCoachId_createdAt_idx
  ON public.class_change_requests ("requestedByCoachId", "createdAt");
CREATE INDEX class_change_requests_status_createdAt_idx
  ON public.class_change_requests (status, "createdAt");
CREATE UNIQUE INDEX class_change_requests_one_pending_per_session
  ON public.class_change_requests ("sessionId") WHERE status = 'PENDING';

ALTER TABLE public.class_change_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.class_change_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.class_change_requests TO authenticated;
CREATE POLICY class_change_requests_staff_read ON public.class_change_requests
  FOR SELECT TO authenticated USING (
    (SELECT public.has_permission('schedule.update'))
    OR (SELECT public.has_permission('schedule.cancel'))
    OR (
      (SELECT public.has_permission('schedule.read.own'))
      AND "requestedByStaffId" = (
        SELECT sm.id FROM public.staff_members sm
        WHERE sm."userId" = (SELECT auth.uid()) AND sm.status = 'ACTIVE'
          AND sm."isSystem" = false
        LIMIT 1
      )
      AND "requestedByCoachId" = (SELECT public.linked_coach_id())
    )
  );

-- Audit status changes inside the same transaction, including seed upserts.
CREATE FUNCTION app_private.audit_class_change_status() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_events (
      id, "entityType", "entityId", action, "actorType", "actorId",
      "beforeStatus", "afterStatus", metadata, "occurredAt", "createdAt", "updatedAt"
    ) VALUES (
      concat('ccra-', md5(random()::text || clock_timestamp()::text)),
      'class_change_request', NEW.id, 'class_change_request.status_changed',
      'STAFF', coalesce(NEW."reviewedByStaffId", NEW."requestedByStaffId"),
      OLD.status::text, NEW.status::text,
      jsonb_build_object('sessionId', NEW."sessionId", 'kind', NEW.kind::text),
      now(), now(), now()
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.audit_class_change_status() FROM PUBLIC;
CREATE TRIGGER class_change_status_audit AFTER UPDATE OF status
  ON public.class_change_requests FOR EACH ROW
  EXECUTE FUNCTION app_private.audit_class_change_status();

COMMIT;
