-- BE-001…BE-016 / BE-019 tables, enums, constraints.
-- RLS and storage policies: 20260919120300.
-- Capacity/jobs/reporting functions: 20260919120100 / 20260919120200.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CI/local stub if auth.users is absent (hosted Supabase already has it).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY,
      email text,
      raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      raw_app_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;

CREATE TYPE "booking_status" AS ENUM (
  'WAITLISTED',
  'HELD_AWAITING_PAYMENT',
  'PAYMENT_SUBMITTED',
  'CONFIRMED',
  'CANCELLATION_REQUESTED',
  'RESCHEDULE_REQUESTED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED',
  'CHECKED_IN',
  'COMPLETED',
  'NO_SHOW'
);

CREATE TYPE "payment_method" AS ENUM ('GCASH', 'PAY_AT_COUNTER');

CREATE TYPE "payment_status" AS ENUM (
  'NONE',
  'PROOF_SUBMITTED',
  'CASH_RECEIVED',
  'VERIFIED',
  'REJECTED'
);

CREATE TYPE "refund_status" AS ENUM ('NOT_APPLICABLE', 'REFUND_PENDING', 'REFUNDED');

CREATE TYPE "coach_rate_type" AS ENUM ('PER_SESSION', 'PER_HOUR');

CREATE TYPE "session_status" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

CREATE TYPE "staff_role" AS ENUM ('ADMIN');

CREATE TYPE "staff_status" AS ENUM ('ACTIVE', 'DISABLED');

CREATE TYPE "waitlist_status" AS ENUM ('WAITING', 'PROMOTED', 'WITHDRAWN', 'EXPIRED');

CREATE TYPE "request_resolution" AS ENUM ('OPEN', 'COMPLETED', 'REJECTED');

CREATE TYPE "audit_actor_type" AS ENUM ('STAFF', 'SYSTEM', 'CUSTOMER');

CREATE TYPE "policy_document_kind" AS ENUM (
  'WAIVER',
  'GYM_POLICY',
  'PARTICIPATION_RULES',
  'CANCELLATION_REFUND'
);

CREATE TABLE "developer_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "developer_config_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "developer_config_key_key" ON "developer_config"("key");
CREATE INDEX "developer_config_key_idx" ON "developer_config"("key");

INSERT INTO "developer_config" ("id", "key", "value", "createdAt", "updatedAt")
VALUES
  ('cfg_hold_hours', 'BOOKING_HOLD_DURATION_HOURS', '8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cfg_cutoff_mins', 'BOOKING_CUTOFF_MINUTES_BEFORE_START', '15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "profiles_email_idx" ON "profiles"("email");

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_fkey"
  FOREIGN KEY ("id") REFERENCES auth.users(id) ON DELETE CASCADE;

COMMENT ON TABLE "profiles" IS
  'BE-002 customer identity. OQ-3: full name, email, contact number only. No DOB, health, or emergency-contact columns until the business requires them. Created by app_private.handle_new_user on auth.users insert.';

CREATE TABLE "staff_members" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "staff_role" NOT NULL DEFAULT 'ADMIN',
    "status" "staff_status" NOT NULL DEFAULT 'ACTIVE',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staff_members_userId_key" ON "staff_members"("userId");
CREATE INDEX "staff_members_status_idx" ON "staff_members"("status");
CREATE INDEX "staff_members_email_idx" ON "staff_members"("email");

ALTER TABLE "staff_members"
  ADD CONSTRAINT "staff_members_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT;

COMMENT ON TABLE "staff_members" IS
  'BE-003 admin authorisation. Coach rates, sales reports, refund totals, and capacity reporting are gated by is_admin() over active ADMIN rows. isSystem rows are job actors and are never admins.';

CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialties" TEXT[] NOT NULL,
    "shortBio" TEXT NOT NULL DEFAULT '',
    "photoKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "defaultRate" DECIMAL(12,2) NOT NULL,
    "rateType" "coach_rate_type" NOT NULL,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "coaches_active_idx" ON "coaches"("active");

CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "defaultDurationMinutes" INTEGER,
    "defaultCustomerPrice" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");
CREATE INDEX "classes_active_idx" ON "classes"("active");

CREATE TABLE "class_coaches" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "class_coaches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "class_coaches_classId_coachId_key" ON "class_coaches"("classId", "coachId");
CREATE INDEX "class_coaches_coachId_idx" ON "class_coaches"("coachId");

ALTER TABLE "class_coaches"
  ADD CONSTRAINT "class_coaches_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "class_coaches"
  ADD CONSTRAINT "class_coaches_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "coachId" TEXT,
    "startsAt" TIMESTAMPTZ NOT NULL,
    "endsAt" TIMESTAMPTZ NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'DRAFT',
    "customerPrice" DECIMAL(12,2) NOT NULL,
    "coachRate" DECIMAL(12,2) NOT NULL,
    "coachRateType" "coach_rate_type" NOT NULL,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sessions_time_order" CHECK ("endsAt" > "startsAt"),
    CONSTRAINT "sessions_capacity_positive" CHECK ("capacity" > 0)
);

CREATE INDEX "sessions_startsAt_idx" ON "sessions"("startsAt");
CREATE INDEX "sessions_status_startsAt_idx" ON "sessions"("status", "startsAt");
CREATE INDEX "sessions_classId_idx" ON "sessions"("classId");
CREATE INDEX "sessions_coachId_idx" ON "sessions"("coachId");

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "policy_documents" (
    "id" TEXT NOT NULL,
    "kind" "policy_document_kind" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "policy_documents_slug_key" ON "policy_documents"("slug");

CREATE TABLE "policy_document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMPTZ NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "policy_document_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "policy_document_versions_documentId_version_key"
  ON "policy_document_versions"("documentId", "version");
CREATE INDEX "policy_document_versions_documentId_isCurrent_idx"
  ON "policy_document_versions"("documentId", "isCurrent");
CREATE UNIQUE INDEX "policy_document_versions_one_current"
  ON "policy_document_versions"("documentId")
  WHERE "isCurrent" = true;

ALTER TABLE "policy_document_versions"
  ADD CONSTRAINT "policy_document_versions_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "policy_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "booking_status" NOT NULL,
    "reservedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "holdExpiresAt" TIMESTAMPTZ,
    "bookingReference" TEXT NOT NULL,
    "paymentMethod" "payment_method",
    "checkedInAt" TIMESTAMPTZ,
    "checkedInById" TEXT,
    "noShowMarkedAt" TIMESTAMPTZ,
    "noShowMarkedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookings_bookingReference_key" ON "bookings"("bookingReference");
CREATE INDEX "bookings_sessionId_status_idx" ON "bookings"("sessionId", "status");
CREATE INDEX "bookings_profileId_status_idx" ON "bookings"("profileId", "status");
CREATE INDEX "bookings_holdExpiresAt_idx" ON "bookings"("holdExpiresAt");
CREATE UNIQUE INDEX "bookings_one_active_mainlist"
  ON "bookings"("profileId", "sessionId")
  WHERE "status" IN (
    'HELD_AWAITING_PAYMENT',
    'PAYMENT_SUBMITTED',
    'CONFIRMED',
    'CANCELLATION_REQUESTED',
    'RESCHEDULE_REQUESTED',
    'CHECKED_IN'
  );

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "booking_policy_acceptances" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "policyVersionId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "booking_policy_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_policy_acceptances_bookingId_policyVersionId_key"
  ON "booking_policy_acceptances"("bookingId", "policyVersionId");
CREATE INDEX "booking_policy_acceptances_profileId_acceptedAt_idx"
  ON "booking_policy_acceptances"("profileId", "acceptedAt");

ALTER TABLE "booking_policy_acceptances"
  ADD CONSTRAINT "booking_policy_acceptances_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "booking_policy_acceptances"
  ADD CONSTRAINT "booking_policy_acceptances_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "booking_policy_acceptances"
  ADD CONSTRAINT "booking_policy_acceptances_policyVersionId_fkey"
  FOREIGN KEY ("policyVersionId") REFERENCES "policy_document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "method" "payment_method" NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'NONE',
    "amount" DECIMAL(12,2) NOT NULL,
    "proofObjectKey" TEXT,
    "submittedAt" TIMESTAMPTZ,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMPTZ,
    "adminNote" TEXT,
    "referenceNumber" TEXT,
    "payerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payments_status_createdAt_idx" ON "payments"("status", "createdAt");
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" "refund_status" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "amount" DECIMAL(12,2) NOT NULL,
    "markedPendingById" TEXT,
    "markedPendingAt" TIMESTAMPTZ,
    "markedRefundedById" TEXT,
    "markedRefundedAt" TIMESTAMPTZ,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "refunds_status_createdAt_idx" ON "refunds"("status", "createdAt");
CREATE INDEX "refunds_bookingId_idx" ON "refunds"("bookingId");

ALTER TABLE "refunds"
  ADD CONSTRAINT "refunds_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "refunds"
  ADD CONSTRAINT "refunds_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "bookingId" TEXT,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequence" BIGINT NOT NULL,
    "status" "waitlist_status" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "waitlist_entries_sessionId_status_sequence_idx"
  ON "waitlist_entries"("sessionId", "status", "sequence");
CREATE INDEX "waitlist_entries_profileId_idx" ON "waitlist_entries"("profileId");
CREATE UNIQUE INDEX "waitlist_entries_one_waiting"
  ON "waitlist_entries"("profileId", "sessionId")
  WHERE "status" = 'WAITING';

ALTER TABLE "waitlist_entries"
  ADD CONSTRAINT "waitlist_entries_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "waitlist_entries"
  ADD CONSTRAINT "waitlist_entries_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "waitlist_entries"
  ADD CONSTRAINT "waitlist_entries_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "cancellation_requests" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requesterId" UUID NOT NULL,
    "reason" TEXT,
    "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolution" "request_resolution" NOT NULL DEFAULT 'OPEN',
    "resolverId" TEXT,
    "resolvedAt" TIMESTAMPTZ,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cancellation_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cancellation_requests_resolution_requestedAt_idx"
  ON "cancellation_requests"("resolution", "requestedAt");
CREATE INDEX "cancellation_requests_bookingId_idx" ON "cancellation_requests"("bookingId");
CREATE UNIQUE INDEX "cancellation_requests_one_open"
  ON "cancellation_requests"("bookingId")
  WHERE "resolution" = 'OPEN';

ALTER TABLE "cancellation_requests"
  ADD CONSTRAINT "cancellation_requests_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cancellation_requests"
  ADD CONSTRAINT "cancellation_requests_requesterId_fkey"
  FOREIGN KEY ("requesterId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "reschedule_requests" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "requesterId" UUID NOT NULL,
    "fromSessionId" TEXT NOT NULL,
    "targetSessionId" TEXT,
    "preferenceNote" TEXT,
    "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolution" "request_resolution" NOT NULL DEFAULT 'OPEN',
    "resolverId" TEXT,
    "resolvedAt" TIMESTAMPTZ,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reschedule_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reschedule_requests_resolution_requestedAt_idx"
  ON "reschedule_requests"("resolution", "requestedAt");
CREATE INDEX "reschedule_requests_bookingId_idx" ON "reschedule_requests"("bookingId");
CREATE UNIQUE INDEX "reschedule_requests_one_open"
  ON "reschedule_requests"("bookingId")
  WHERE "resolution" = 'OPEN';

ALTER TABLE "reschedule_requests"
  ADD CONSTRAINT "reschedule_requests_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reschedule_requests"
  ADD CONSTRAINT "reschedule_requests_requesterId_fkey"
  FOREIGN KEY ("requesterId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reschedule_requests"
  ADD CONSTRAINT "reschedule_requests_fromSessionId_fkey"
  FOREIGN KEY ("fromSessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reschedule_requests"
  ADD CONSTRAINT "reschedule_requests_targetSessionId_fkey"
  FOREIGN KEY ("targetSessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" "audit_actor_type" NOT NULL,
    "actorId" TEXT,
    "beforeStatus" TEXT,
    "afterStatus" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "occurredAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_events_entityType_entityId_occurredAt_idx"
  ON "audit_events"("entityType", "entityId", "occurredAt");
CREATE INDEX "audit_events_actorId_occurredAt_idx"
  ON "audit_events"("actorId", "occurredAt");

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_checkedInById_fkey"
  FOREIGN KEY ("checkedInById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_noShowMarkedById_fkey"
  FOREIGN KEY ("noShowMarkedById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "refunds"
  ADD CONSTRAINT "refunds_markedPendingById_fkey"
  FOREIGN KEY ("markedPendingById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "refunds"
  ADD CONSTRAINT "refunds_markedRefundedById_fkey"
  FOREIGN KEY ("markedRefundedById") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cancellation_requests"
  ADD CONSTRAINT "cancellation_requests_resolverId_fkey"
  FOREIGN KEY ("resolverId") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reschedule_requests"
  ADD CONSTRAINT "reschedule_requests_resolverId_fkey"
  FOREIGN KEY ("resolverId") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_events"
  ADD CONSTRAINT "audit_events_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
