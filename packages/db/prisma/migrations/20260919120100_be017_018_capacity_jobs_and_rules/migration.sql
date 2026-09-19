-- BE-017 / BE-018 / transition + request helpers. SECURITY DEFINER lives in app_private.

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.new_id()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'c' || replace(gen_random_uuid()::text, '-', '');
$$;

CREATE OR REPLACE FUNCTION app_private.opaque_reference()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT encode(gen_random_bytes(16), 'hex');
$$;

CREATE OR REPLACE FUNCTION app_private.developer_config_int(p_key text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "value"::integer
  FROM public.developer_config
  WHERE "key" = p_key;
$$;

CREATE OR REPLACE FUNCTION app_private.compute_hold_expires_at(
  p_reserved_at timestamptz,
  p_starts_at timestamptz
)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LEAST(
    p_reserved_at + make_interval(hours => app_private.developer_config_int('BOOKING_HOLD_DURATION_HOURS')),
    p_starts_at
  );
$$;

CREATE OR REPLACE FUNCTION app_private.session_is_past_cutoff(
  p_session_id text,
  p_at timestamptz DEFAULT clock_timestamp()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_at >= s."startsAt" - make_interval(
    mins => app_private.developer_config_int('BOOKING_CUTOFF_MINUTES_BEFORE_START')
  )
  FROM public.sessions s
  WHERE s.id = p_session_id;
$$;

-- Single source of truth for consumed main-list capacity (BE-017).
CREATE OR REPLACE FUNCTION app_private.session_consumed_capacity(p_session_id text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.bookings b
  WHERE b."sessionId" = p_session_id
    AND b.status IN (
      'HELD_AWAITING_PAYMENT',
      'PAYMENT_SUBMITTED',
      'CONFIRMED',
      'CANCELLATION_REQUESTED',
      'RESCHEDULE_REQUESTED',
      'CHECKED_IN'
    );
$$;

CREATE OR REPLACE FUNCTION public.session_consumed_capacity(p_session_id text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.session_consumed_capacity(p_session_id);
$$;

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
    WHERE sm."userId" = p_uid
      AND sm.role = 'ADMIN'
      AND sm.status = 'ACTIVE'
      AND sm."isSystem" = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.is_admin(COALESCE(p_uid, auth.uid()));
$$;

CREATE OR REPLACE FUNCTION app_private.system_staff_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.staff_members WHERE "isSystem" = true LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app_private.write_audit(
  p_entity_type text,
  p_entity_id text,
  p_action text,
  p_actor_type "audit_actor_type",
  p_actor_id text,
  p_before text,
  p_after text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_events (
    id, "entityType", "entityId", action, "actorType", "actorId",
    "beforeStatus", "afterStatus", metadata, "occurredAt", "createdAt", "updatedAt"
  ) VALUES (
    app_private.new_id(), p_entity_type, p_entity_id, p_action, p_actor_type, p_actor_id,
    p_before, p_after, COALESCE(p_metadata, '{}'::jsonb), clock_timestamp(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );
END;
$$;

CREATE OR REPLACE FUNCTION app_private.booking_transition_allowed(
  p_from "booking_status",
  p_to "booking_status"
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_to = 'COMPLETED' THEN false -- OQ-10: enum exists, no transition
    WHEN p_from = p_to THEN true
    WHEN p_from = 'WAITLISTED' AND p_to IN ('HELD_AWAITING_PAYMENT', 'CANCELLED', 'EXPIRED') THEN true
    WHEN p_from = 'HELD_AWAITING_PAYMENT' AND p_to IN (
      'PAYMENT_SUBMITTED', 'CONFIRMED', 'EXPIRED', 'REJECTED', 'CANCELLED',
      'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED'
    ) THEN true
    WHEN p_from = 'PAYMENT_SUBMITTED' AND p_to IN (
      'CONFIRMED', 'REJECTED', 'HELD_AWAITING_PAYMENT', 'CANCELLATION_REQUESTED',
      'RESCHEDULE_REQUESTED', 'CANCELLED'
    ) THEN true
    WHEN p_from = 'CONFIRMED' AND p_to IN (
      'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN', 'NO_SHOW',
      'CANCELLED', 'REJECTED'
    ) THEN true
    WHEN p_from = 'CANCELLATION_REQUESTED' AND p_to IN (
      'CANCELLED', 'CONFIRMED', 'HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CHECKED_IN'
    ) THEN true
    WHEN p_from = 'RESCHEDULE_REQUESTED' AND p_to IN (
      'CONFIRMED', 'HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CHECKED_IN', 'CANCELLED'
    ) THEN true
    WHEN p_from = 'CHECKED_IN' AND p_to IN ('NO_SHOW') THEN false
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.transition_booking(
  p_booking_id text,
  p_to "booking_status",
  p_actor_type "audit_actor_type",
  p_actor_id text,
  p_action text DEFAULT 'booking.transition',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS "booking_status"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from "booking_status";
BEGIN
  SELECT status INTO v_from FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF p_to = 'COMPLETED' THEN
    RAISE EXCEPTION 'completed_blocked_oq10' USING ERRCODE = 'P0001';
  END IF;
  IF NOT app_private.booking_transition_allowed(v_from, p_to) THEN
    RAISE EXCEPTION 'illegal_booking_transition: % -> %', v_from, p_to USING ERRCODE = 'P0001';
  END IF;
  UPDATE bookings
    SET status = p_to, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;
  PERFORM app_private.write_audit(
    'booking', p_booking_id, p_action, p_actor_type, p_actor_id,
    v_from::text, p_to::text, p_metadata
  );
  RETURN p_to;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.assert_required_acceptances(p_booking_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM policy_documents d
    JOIN policy_document_versions v
      ON v."documentId" = d.id AND v."isCurrent" = true
    WHERE d.required = true
      AND NOT EXISTS (
        SELECT 1 FROM booking_policy_acceptances a
        WHERE a."bookingId" = p_booking_id
          AND a."policyVersionId" = v.id
      )
  ) THEN
    RAISE EXCEPTION 'missing_required_policy_acceptance' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.evaluate_waitlist_promotion(p_session_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry waitlist_entries%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_session sessions%ROWTYPE;
  v_hold timestamptz;
  v_system text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_session_id, 0));
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  IF v_session.status <> 'PUBLISHED' THEN
    RETURN NULL;
  END IF;
  IF app_private.session_is_past_cutoff(p_session_id) THEN
    RETURN NULL;
  END IF;
  IF app_private.session_consumed_capacity(p_session_id) >= v_session.capacity THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_entry
  FROM waitlist_entries
  WHERE "sessionId" = p_session_id AND status = 'WAITING'
  ORDER BY sequence ASC, "joinedAt" ASC, id ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_system := app_private.system_staff_id();
  v_hold := app_private.compute_hold_expires_at(clock_timestamp(), v_session."startsAt");

  UPDATE waitlist_entries
    SET status = 'PROMOTED', "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_entry.id;

  IF v_entry."bookingId" IS NOT NULL THEN
    UPDATE bookings
      SET status = 'HELD_AWAITING_PAYMENT',
          "holdExpiresAt" = v_hold,
          "reservedAt" = clock_timestamp(),
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_entry."bookingId";
    PERFORM app_private.write_audit(
      'booking', v_entry."bookingId", 'waitlist.promote', 'SYSTEM', v_system,
      'WAITLISTED', 'HELD_AWAITING_PAYMENT',
      jsonb_build_object('waitlistEntryId', v_entry.id)
    );
    PERFORM app_private.write_audit(
      'waitlist_entry', v_entry.id, 'waitlist.promote', 'SYSTEM', v_system,
      'WAITING', 'PROMOTED', jsonb_build_object('bookingId', v_entry."bookingId")
    );
    RETURN v_entry."bookingId";
  END IF;

  INSERT INTO bookings (
    id, "profileId", "sessionId", status, "reservedAt", "holdExpiresAt",
    "bookingReference", "createdAt", "updatedAt"
  ) VALUES (
    app_private.new_id(), v_entry."profileId", p_session_id, 'HELD_AWAITING_PAYMENT',
    clock_timestamp(), v_hold, app_private.opaque_reference(),
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
  RETURNING * INTO v_booking;

  UPDATE waitlist_entries
    SET "bookingId" = v_booking.id, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = v_entry.id;

  PERFORM app_private.write_audit(
    'booking', v_booking.id, 'waitlist.promote', 'SYSTEM', v_system,
    NULL, 'HELD_AWAITING_PAYMENT',
    jsonb_build_object('waitlistEntryId', v_entry.id)
  );
  RETURN v_booking.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_holds_and_promote_waitlist()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_system text;
  v_expired int := 0;
  v_promoted int := 0;
  v_session_id text;
  v_promoted_id text;
BEGIN
  v_system := app_private.system_staff_id();

  FOR v_booking IN
    SELECT id, "sessionId", status
    FROM bookings
    WHERE status = 'HELD_AWAITING_PAYMENT'
      AND "holdExpiresAt" IS NOT NULL
      AND "holdExpiresAt" <= clock_timestamp()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE bookings
      SET status = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_booking.id;
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'hold.expire', 'SYSTEM', v_system,
      v_booking.status::text, 'EXPIRED', '{}'::jsonb
    );
    v_expired := v_expired + 1;
    v_promoted_id := public.evaluate_waitlist_promotion(v_booking."sessionId");
    IF v_promoted_id IS NOT NULL THEN
      v_promoted := v_promoted + 1;
    END IF;
  END LOOP;

  FOR v_session_id IN
    SELECT DISTINCT w."sessionId"
    FROM waitlist_entries w
    WHERE w.status = 'WAITING'
  LOOP
    v_promoted_id := public.evaluate_waitlist_promotion(v_session_id);
    IF v_promoted_id IS NOT NULL THEN
      v_promoted := v_promoted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('expired', v_expired, 'promoted', v_promoted);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_reservation(
  p_profile_id uuid,
  p_session_id text,
  p_acceptance_version_ids text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session sessions%ROWTYPE;
  v_booking_id text;
  v_waitlist_id text;
  v_hold timestamptz;
  v_seq bigint;
  v_version text;
  v_consumed int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_session_id, 0));

  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_session.status <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'session_not_reservable' USING ERRCODE = 'P0001';
  END IF;
  IF app_private.session_is_past_cutoff(p_session_id) THEN
    RAISE EXCEPTION 'booking_cutoff_reached' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE "profileId" = p_profile_id
      AND "sessionId" = p_session_id
      AND status IN (
        'HELD_AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED',
        'CANCELLATION_REQUESTED', 'RESCHEDULE_REQUESTED', 'CHECKED_IN', 'WAITLISTED'
      )
  ) THEN
    RAISE EXCEPTION 'duplicate_active_reservation' USING ERRCODE = 'P0001';
  END IF;

  v_booking_id := app_private.new_id();
  v_hold := app_private.compute_hold_expires_at(clock_timestamp(), v_session."startsAt");
  v_consumed := app_private.session_consumed_capacity(p_session_id);

  IF v_consumed < v_session.capacity THEN
    INSERT INTO bookings (
      id, "profileId", "sessionId", status, "reservedAt", "holdExpiresAt",
      "bookingReference", "createdAt", "updatedAt"
    ) VALUES (
      v_booking_id, p_profile_id, p_session_id, 'HELD_AWAITING_PAYMENT',
      clock_timestamp(), v_hold, app_private.opaque_reference(),
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
  ELSE
    SELECT COALESCE(MAX(sequence), 0) + 1 INTO v_seq
    FROM waitlist_entries WHERE "sessionId" = p_session_id;

    INSERT INTO bookings (
      id, "profileId", "sessionId", status, "reservedAt", "holdExpiresAt",
      "bookingReference", "createdAt", "updatedAt"
    ) VALUES (
      v_booking_id, p_profile_id, p_session_id, 'WAITLISTED',
      clock_timestamp(), NULL, app_private.opaque_reference(),
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    v_waitlist_id := app_private.new_id();
    INSERT INTO waitlist_entries (
      id, "sessionId", "profileId", "bookingId", "joinedAt", sequence, status,
      "createdAt", "updatedAt"
    ) VALUES (
      v_waitlist_id, p_session_id, p_profile_id, v_booking_id,
      clock_timestamp(), v_seq, 'WAITING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
  END IF;

  IF p_acceptance_version_ids IS NOT NULL THEN
    FOREACH v_version IN ARRAY p_acceptance_version_ids
    LOOP
      INSERT INTO booking_policy_acceptances (
        id, "bookingId", "profileId", "policyVersionId", "acceptedAt", "createdAt", "updatedAt"
      ) VALUES (
        app_private.new_id(), v_booking_id, p_profile_id, v_version,
        clock_timestamp(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    END LOOP;
  END IF;

  PERFORM app_private.assert_required_acceptances(v_booking_id);

  PERFORM app_private.write_audit(
    'booking', v_booking_id, 'booking.create', 'CUSTOMER', NULL,
    NULL,
    CASE WHEN v_waitlist_id IS NULL THEN 'HELD_AWAITING_PAYMENT' ELSE 'WAITLISTED' END,
    jsonb_build_object('sessionId', p_session_id, 'waitlistEntryId', v_waitlist_id)
  );

  RETURN jsonb_build_object(
    'bookingId', v_booking_id,
    'kind', CASE WHEN v_waitlist_id IS NULL THEN 'hold' ELSE 'waitlist' END,
    'waitlistEntryId', v_waitlist_id,
    'holdExpiresAt', v_hold
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_cancellation_request(
  p_booking_id text,
  p_requester_id uuid,
  p_reason text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id text;
  v_status "booking_status";
BEGIN
  SELECT status INTO v_status FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found' USING ERRCODE = 'P0002';
  END IF;
  v_id := app_private.new_id();
  INSERT INTO cancellation_requests (
    id, "bookingId", "requesterId", reason, "requestedAt", resolution,
    "createdAt", "updatedAt"
  ) VALUES (
    v_id, p_booking_id, p_requester_id, p_reason, clock_timestamp(), 'OPEN',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );
  PERFORM public.transition_booking(
    p_booking_id, 'CANCELLATION_REQUESTED', 'CUSTOMER', NULL,
    'cancellation.request', jsonb_build_object('requestId', v_id)
  );
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_cancellation_request(
  p_request_id text,
  p_resolver_id text,
  p_resolution "request_resolution",
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req cancellation_requests%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_restore "booking_status";
BEGIN
  IF p_resolution = 'OPEN' THEN
    RAISE EXCEPTION 'invalid_resolution' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_req FROM cancellation_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.resolution <> 'OPEN' THEN
    RAISE EXCEPTION 'request_not_open' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_booking FROM bookings WHERE id = v_req."bookingId" FOR UPDATE;

  UPDATE cancellation_requests
    SET resolution = p_resolution,
        "resolverId" = p_resolver_id,
        "resolvedAt" = clock_timestamp(),
        "resolutionNote" = p_note,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_request_id;

  IF p_resolution = 'COMPLETED' THEN
    PERFORM public.transition_booking(
      v_booking.id, 'CANCELLED', 'STAFF', p_resolver_id,
      'cancellation.complete', jsonb_build_object('requestId', p_request_id)
    );
    PERFORM public.evaluate_waitlist_promotion(v_booking."sessionId");
  ELSE
    SELECT (a."beforeStatus")::"booking_status" INTO v_restore
    FROM audit_events a
    WHERE a."entityId" = v_booking.id
      AND a.action = 'cancellation.request'
    ORDER BY a."occurredAt" DESC
    LIMIT 1;
    IF v_restore IS NULL THEN
      v_restore := 'CONFIRMED';
    END IF;
    UPDATE bookings SET status = v_restore, "updatedAt" = CURRENT_TIMESTAMP WHERE id = v_booking.id;
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'cancellation.reject', 'STAFF', p_resolver_id,
      'CANCELLATION_REQUESTED', v_restore::text,
      jsonb_build_object('requestId', p_request_id)
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_reschedule_request(
  p_booking_id text,
  p_requester_id uuid,
  p_target_session_id text,
  p_note text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id text;
  v_from text;
BEGIN
  SELECT "sessionId" INTO v_from FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_not_found' USING ERRCODE = 'P0002';
  END IF;
  v_id := app_private.new_id();
  INSERT INTO reschedule_requests (
    id, "bookingId", "requesterId", "fromSessionId", "targetSessionId",
    "preferenceNote", "requestedAt", resolution, "createdAt", "updatedAt"
  ) VALUES (
    v_id, p_booking_id, p_requester_id, v_from, p_target_session_id,
    p_note, clock_timestamp(), 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );
  PERFORM public.transition_booking(
    p_booking_id, 'RESCHEDULE_REQUESTED', 'CUSTOMER', NULL,
    'reschedule.request', jsonb_build_object('requestId', v_id)
  );
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_reschedule_request(
  p_request_id text,
  p_resolver_id text,
  p_resolution "request_resolution",
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req reschedule_requests%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_target sessions%ROWTYPE;
  v_restore "booking_status";
BEGIN
  SELECT * INTO v_req FROM reschedule_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.resolution <> 'OPEN' THEN
    RAISE EXCEPTION 'request_not_open' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO v_booking FROM bookings WHERE id = v_req."bookingId" FOR UPDATE;

  UPDATE reschedule_requests
    SET resolution = p_resolution,
        "resolverId" = p_resolver_id,
        "resolvedAt" = clock_timestamp(),
        "resolutionNote" = p_note,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_request_id;

  IF p_resolution = 'COMPLETED' THEN
    IF v_req."targetSessionId" IS NULL THEN
      RAISE EXCEPTION 'target_session_required' USING ERRCODE = 'P0001';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(v_req."targetSessionId", 0));
    SELECT * INTO v_target FROM sessions WHERE id = v_req."targetSessionId";
    IF app_private.session_consumed_capacity(v_target.id) >= v_target.capacity THEN
      RAISE EXCEPTION 'target_session_full' USING ERRCODE = 'P0001';
    END IF;
    UPDATE bookings
      SET "sessionId" = v_target.id,
          status = 'CONFIRMED',
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = v_booking.id;
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'reschedule.approve', 'STAFF', p_resolver_id,
      'RESCHEDULE_REQUESTED', 'CONFIRMED',
      jsonb_build_object(
        'requestId', p_request_id,
        'fromSessionId', v_req."fromSessionId",
        'toSessionId', v_target.id
      )
    );
    PERFORM public.evaluate_waitlist_promotion(v_req."fromSessionId");
  ELSE
    SELECT (a."beforeStatus")::"booking_status" INTO v_restore
    FROM audit_events a
    WHERE a."entityId" = v_booking.id AND a.action = 'reschedule.request'
    ORDER BY a."occurredAt" DESC LIMIT 1;
    IF v_restore IS NULL THEN
      v_restore := 'CONFIRMED';
    END IF;
    UPDATE bookings SET status = v_restore, "updatedAt" = CURRENT_TIMESTAMP WHERE id = v_booking.id;
    PERFORM app_private.write_audit(
      'booking', v_booking.id, 'reschedule.reject', 'STAFF', p_resolver_id,
      'RESCHEDULE_REQUESTED', v_restore::text,
      jsonb_build_object('requestId', p_request_id)
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_booking(
  p_booking_id text,
  p_actor_id text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session text;
BEGIN
  SELECT "sessionId" INTO v_session FROM bookings WHERE id = p_booking_id FOR UPDATE;
  PERFORM public.transition_booking(
    p_booking_id, 'REJECTED', 'STAFF', p_actor_id,
    'booking.reject', jsonb_build_object('reason', p_reason)
  );
  PERFORM public.evaluate_waitlist_promotion(v_session);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_in_booking(
  p_booking_id text,
  p_actor_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status "booking_status";
BEGIN
  SELECT status INTO v_status FROM bookings WHERE id = p_booking_id FOR UPDATE;
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

CREATE OR REPLACE FUNCTION public.mark_no_show(
  p_booking_id text,
  p_actor_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status "booking_status";
BEGIN
  SELECT status INTO v_status FROM bookings WHERE id = p_booking_id FOR UPDATE;
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
  -- R54: never create or advance a refund for no-show.
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_refund(
  p_refund_id text,
  p_to "refund_status",
  p_actor_id text,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from "refund_status";
BEGIN
  SELECT status INTO v_from FROM refunds WHERE id = p_refund_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'refund_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF NOT (
    (v_from = 'NOT_APPLICABLE' AND p_to = 'REFUND_PENDING')
    OR (v_from = 'REFUND_PENDING' AND p_to = 'REFUNDED')
  ) THEN
    RAISE EXCEPTION 'illegal_refund_transition: % -> %', v_from, p_to USING ERRCODE = 'P0001';
  END IF;
  IF p_to = 'REFUND_PENDING' THEN
    UPDATE refunds SET
      status = p_to,
      "markedPendingById" = p_actor_id,
      "markedPendingAt" = clock_timestamp(),
      note = COALESCE(p_note, note),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_refund_id;
  ELSE
    UPDATE refunds SET
      status = p_to,
      "markedRefundedById" = p_actor_id,
      "markedRefundedAt" = clock_timestamp(),
      note = COALESCE(p_note, note),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_refund_id;
  END IF;
  PERFORM app_private.write_audit(
    'refund', p_refund_id, 'refund.transition', 'STAFF', p_actor_id,
    v_from::text, p_to::text, jsonb_build_object('note', p_note)
  );
END;
$$;

-- Triggers: hold cap, capacity invariant, immutability, payment proof, snapshot freeze.

CREATE OR REPLACE FUNCTION app_private.enforce_hold_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_starts timestamptz;
BEGIN
  SELECT "startsAt" INTO v_starts FROM sessions WHERE id = NEW."sessionId";
  IF NEW."holdExpiresAt" IS NOT NULL AND NEW."holdExpiresAt" > v_starts THEN
    RAISE EXCEPTION 'hold_expires_after_session_start' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_hold_cap
  BEFORE INSERT OR UPDATE OF "holdExpiresAt", "sessionId" ON bookings
  FOR EACH ROW EXECUTE FUNCTION app_private.enforce_hold_cap();

CREATE OR REPLACE FUNCTION app_private.enforce_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cap int;
  v_used int;
BEGIN
  SELECT capacity INTO v_cap FROM sessions WHERE id = NEW."sessionId";
  v_used := app_private.session_consumed_capacity(NEW."sessionId");
  IF v_used > v_cap THEN
    RAISE EXCEPTION 'capacity_exceeded' USING ERRCODE = 'P0001';
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER bookings_capacity_guard
  AFTER INSERT OR UPDATE OF status, "sessionId" ON bookings
  FOR EACH ROW EXECUTE FUNCTION app_private.enforce_capacity();

CREATE OR REPLACE FUNCTION app_private.prevent_booking_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'bookings_are_append_only' USING ERRCODE = 'P0001';
END;
$$;

CREATE TRIGGER bookings_no_delete
  BEFORE DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION app_private.prevent_booking_delete();

CREATE OR REPLACE FUNCTION app_private.prevent_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'row_is_append_only' USING ERRCODE = 'P0001';
END;
$$;

CREATE TRIGGER acceptances_no_update
  BEFORE UPDATE ON booking_policy_acceptances
  FOR EACH ROW EXECUTE FUNCTION app_private.prevent_mutation();

CREATE TRIGGER acceptances_no_delete
  BEFORE DELETE ON booking_policy_acceptances
  FOR EACH ROW EXECUTE FUNCTION app_private.prevent_mutation();

CREATE TRIGGER audit_no_update
  BEFORE UPDATE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION app_private.prevent_mutation();

CREATE TRIGGER audit_no_delete
  BEFORE DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION app_private.prevent_mutation();

CREATE OR REPLACE FUNCTION app_private.protect_policy_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF EXISTS (SELECT 1 FROM booking_policy_acceptances WHERE "policyVersionId" = OLD.id) THEN
      RAISE EXCEPTION 'policy_version_referenced' USING ERRCODE = 'P0001';
    END IF;
    RETURN OLD;
  END IF;
  IF EXISTS (SELECT 1 FROM booking_policy_acceptances WHERE "policyVersionId" = NEW.id) THEN
    IF NEW.body IS DISTINCT FROM OLD.body
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.version IS DISTINCT FROM OLD.version
      OR NEW."documentId" IS DISTINCT FROM OLD."documentId"
    THEN
      RAISE EXCEPTION 'policy_version_immutable_once_accepted' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER policy_versions_protect
  BEFORE UPDATE OR DELETE ON policy_document_versions
  FOR EACH ROW EXECUTE FUNCTION app_private.protect_policy_version();

CREATE OR REPLACE FUNCTION app_private.protect_session_snapshot()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Coach rate changes must not back-write session snapshots. Session
  -- customerPrice/coachRate/coachRateType are independently editable by admin.
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.enforce_payment_proof()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'PROOF_SUBMITTED' THEN
    IF NEW.method <> 'GCASH' OR NEW."proofObjectKey" IS NULL OR NEW."proofObjectKey" = '' THEN
      RAISE EXCEPTION 'gcash_proof_required' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  IF NEW.method = 'PAY_AT_COUNTER' AND NEW.status = 'PROOF_SUBMITTED' THEN
    RAISE EXCEPTION 'cash_does_not_use_proof' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_proof_rules
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION app_private.enforce_payment_proof();

CREATE OR REPLACE FUNCTION app_private.restrict_customer_booking_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR app_private.is_admin(auth.uid()) THEN
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

CREATE TRIGGER bookings_restrict_customer_writes
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION app_private.restrict_customer_booking_writes();

CREATE OR REPLACE FUNCTION app_private.snapshot_session_from_coach()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate numeric;
  v_type "coach_rate_type";
BEGIN
  IF NEW."coachId" IS NOT NULL AND TG_OP = 'INSERT' THEN
    SELECT "defaultRate", "rateType" INTO v_rate, v_type FROM coaches WHERE id = NEW."coachId";
    IF NEW."coachRate" IS NULL THEN
      NEW."coachRate" := v_rate;
    END IF;
    IF NEW."coachRateType" IS NULL THEN
      NEW."coachRateType" := v_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Prisma requires NOT NULL on snapshot columns; copy happens in application/seed.
-- Keep a BEFORE INSERT helper that fills only when defaults are sent as 0 and
-- a flag is used — callers should pass explicit snapshot values.

CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, "fullName", email, "contactNumber", "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Member'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app_private.handle_new_user();

CREATE OR REPLACE FUNCTION app_private.cancel_session(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sessions
    SET status = 'CANCELLED', "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_session_id;
  -- History preserved; bookings stay. New reservations rejected by status check.
END;
$$;

-- Optional pg_cron schedule (hosted). Human-only if the extension is absent.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'balanse-expire-holds-promote';
    PERFORM cron.schedule(
      'balanse-expire-holds-promote',
      '*/5 * * * *',
      $cron$SELECT public.expire_holds_and_promote_waitlist()$cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not scheduled: %', SQLERRM;
END $$;
