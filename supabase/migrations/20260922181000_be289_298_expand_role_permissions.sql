-- Mirror of packages/db/prisma/migrations/20260922181000_be289_298_expand_role_permissions.
-- Prisma is source of truth. Not applied to xydundrayuusqizssgby by this PR.

-- #298 / epic #289 — expand: normalized roles + permissions, then seed/backfill.
-- Contract (drop leftover staff_role enum) is deferred; roleId is authorization truth.
-- Does not broaden is_admin(). Existing interactive ADMIN rows become Super Admin.

BEGIN;

CREATE TYPE "staff_role_definition_status" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE public.staff_role_definitions (
  id TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  "builtIn" BOOLEAN NOT NULL DEFAULT false,
  "builtInKey" TEXT,
  "allAccess" BOOLEAN NOT NULL DEFAULT false,
  status "staff_role_definition_status" NOT NULL DEFAULT 'ACTIVE',
  "archivedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT staff_role_definitions_pkey PRIMARY KEY (id),
  CONSTRAINT staff_role_definitions_archive_check CHECK (
    (status = 'ACTIVE' AND "archivedAt" IS NULL)
    OR (status = 'ARCHIVED' AND "archivedAt" IS NOT NULL)
  ),
  CONSTRAINT staff_role_definitions_builtin_key_check CHECK (
    ("builtIn" = false AND "builtInKey" IS NULL AND "allAccess" = false)
    OR ("builtIn" = true AND "builtInKey" IN ('super_admin', 'front_desk', 'coach'))
  ),
  CONSTRAINT staff_role_definitions_super_admin_access_check CHECK (
    "builtInKey" IS DISTINCT FROM 'super_admin' OR "allAccess" = true
  )
);

CREATE UNIQUE INDEX staff_role_definitions_key_key
  ON public.staff_role_definitions (key);
CREATE UNIQUE INDEX staff_role_definitions_builtInKey_key
  ON public.staff_role_definitions ("builtInKey");
CREATE UNIQUE INDEX staff_role_definitions_name_lower_key
  ON public.staff_role_definitions (lower(name));
CREATE INDEX staff_role_definitions_status_idx
  ON public.staff_role_definitions (status);
CREATE INDEX staff_role_definitions_builtIn_status_idx
  ON public.staff_role_definitions ("builtIn", status);

COMMENT ON TABLE public.staff_role_definitions IS
  '#298 role definitions. builtInKey is the #294 contract (super_admin/front_desk/coach). Custom roles use a unique key and never become a StaffRole enum.';

CREATE TABLE public.permission_definitions (
  id TEXT NOT NULL,
  key TEXT NOT NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sensitive BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT permission_definitions_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX permission_definitions_key_key
  ON public.permission_definitions (key);
CREATE INDEX permission_definitions_category_idx
  ON public.permission_definitions (category);
CREATE INDEX permission_definitions_sensitive_idx
  ON public.permission_definitions (sensitive);

COMMENT ON TABLE public.permission_definitions IS
  '#298 canonical permission registry snapshot. Source of truth for keys is @balanse/domain PERMISSION_KEYS.';

CREATE TABLE public.staff_role_permissions (
  id TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT staff_role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT "staff_role_permissions_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES public.staff_role_definitions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "staff_role_permissions_permissionId_fkey"
    FOREIGN KEY ("permissionId") REFERENCES public.permission_definitions(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX staff_role_permissions_roleId_permissionId_key
  ON public.staff_role_permissions ("roleId", "permissionId");
CREATE INDEX staff_role_permissions_permissionId_idx
  ON public.staff_role_permissions ("permissionId");

ALTER TABLE public.staff_members
  ADD COLUMN "roleId" TEXT;

-- ---------------------------------------------------------------------------
-- Seed canonical permissions (idempotent). Includes bundles.read / bundles.manage.
-- ---------------------------------------------------------------------------
INSERT INTO public.permission_definitions
  (id, key, category, label, description, sensitive, "createdAt", "updatedAt")
VALUES
    ('dashboard.operations.read', 'dashboard.operations.read', 'schedule', 'Operational dashboard', 'View operational dashboard counts, attention queues, and today’s schedule.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('dashboard.financial.read', 'dashboard.financial.read', 'schedule', 'Financial dashboard', 'View sales, refund, occupancy-value, and coach-cost dashboard figures.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('schedule.read.all', 'schedule.read.all', 'schedule', 'Read all schedules', 'View every scheduled session.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('schedule.read.own', 'schedule.read.own', 'schedule', 'Read own schedule', 'View sessions assigned to the signed-in staff member’s linked coach.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('schedule.create', 'schedule.create', 'schedule', 'Create sessions', 'Create one-off scheduled sessions.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('schedule.update', 'schedule.update', 'schedule', 'Update sessions', 'Edit existing scheduled sessions.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('schedule.cancel', 'schedule.cancel', 'schedule', 'Cancel sessions', 'Cancel a scheduled session.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('schedule.recurrence.manage', 'schedule.recurrence.manage', 'schedule', 'Manage recurrence', 'Duplicate sessions and manage recurrence rules.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('roster.read.all', 'roster.read.all', 'schedule', 'Read all rosters', 'View every session roster.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('roster.read.own', 'roster.read.own', 'schedule', 'Read own rosters', 'View rosters for sessions assigned to the linked coach.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('attendance.manage.all', 'attendance.manage.all', 'schedule', 'Manage all attendance', 'Check in and mark no-show on any session.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('attendance.manage.own', 'attendance.manage.own', 'schedule', 'Manage own attendance', 'Check in and mark no-show on sessions assigned to the linked coach.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bookings.read', 'bookings.read', 'booking_operations', 'Read bookings', 'View the booking queue and booking detail.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bookings.confirm', 'bookings.confirm', 'booking_operations', 'Confirm bookings', 'Confirm a booking.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bookings.reject', 'bookings.reject', 'booking_operations', 'Reject bookings', 'Reject a booking.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('payments.read', 'payments.read', 'booking_operations', 'Read payments', 'View payment queues.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('payments.review', 'payments.review', 'booking_operations', 'Review payment proof', 'Review GCash payment proof.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('payments.record_cash', 'payments.record_cash', 'booking_operations', 'Record cash', 'Record a pay-at-counter cash payment.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('refunds.read', 'refunds.read', 'booking_operations', 'Read refunds', 'View refund status and refund queues.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('refunds.manage', 'refunds.manage', 'booking_operations', 'Manage refunds', 'Mark refunds pending or refunded.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cancellations.read', 'cancellations.read', 'booking_operations', 'Read cancellations', 'View cancellation requests.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cancellations.manage', 'cancellations.manage', 'booking_operations', 'Manage cancellations', 'Complete or reject cancellation requests.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reschedules.read', 'reschedules.read', 'booking_operations', 'Read reschedules', 'View reschedule requests.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reschedules.manage', 'reschedules.manage', 'booking_operations', 'Manage reschedules', 'Approve or reject reschedule requests.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('customers.read', 'customers.read', 'booking_operations', 'Read customers', 'View the customer directory and detail.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('classes.read', 'classes.read', 'catalogue', 'Read classes', 'View the class catalogue.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('classes.manage', 'classes.manage', 'catalogue', 'Manage classes', 'Create or edit classes.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('coaches.read', 'coaches.read', 'catalogue', 'Read coaches', 'View coach profiles without compensation rates.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('coaches.manage', 'coaches.manage', 'catalogue', 'Manage coaches', 'Create or edit coach profiles (not rates).', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('coach_rates.read', 'coach_rates.read', 'catalogue', 'Read coach rates', 'View coach compensation rates and session rate snapshots.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('coach_rates.manage', 'coach_rates.manage', 'catalogue', 'Manage coach rates', 'Create or change coach compensation rates.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bundles.read', 'bundles.read', 'catalogue', 'Read bundles', 'View the session-bundle catalogue and customer entitlements. Added after #289 for BE-058 routes.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('bundles.manage', 'bundles.manage', 'catalogue', 'Manage bundles', 'Create, edit, publish, archive, grant, revoke, or review session bundles.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reports.sales.read', 'reports.sales.read', 'reports', 'Sales reports', 'View sales overview and class performance revenue.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reports.capacity.read', 'reports.capacity.read', 'reports', 'Capacity reports', 'View occupancy and attendance-utilisation reports.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reports.coach_costs.read', 'reports.coach_costs.read', 'reports', 'Coach-cost reports', 'View coach-cost and contribution reports.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reports.session.read', 'reports.session.read', 'reports', 'Session reports', 'View session drill-downs, including revenue and coach cost.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('staff.read', 'staff.read', 'administration', 'Read staff', 'View staff members and assignment summaries.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('staff.manage', 'staff.manage', 'administration', 'Manage staff', 'Create, update, disable, or link staff accounts.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('roles.read', 'roles.read', 'administration', 'Read roles', 'View role definitions and permission matrices.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('roles.manage', 'roles.manage', 'administration', 'Manage roles', 'Create, clone, update, archive, or assign roles.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('settings.content.manage', 'settings.content.manage', 'administration', 'Manage content settings', 'Edit business, about, contact, and FAQ content.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('settings.policies.manage', 'settings.policies.manage', 'administration', 'Manage policies', 'Create and promote policy document versions.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('settings.payment_qr.manage', 'settings.payment_qr.manage', 'administration', 'Manage payment QR', 'Upload, activate, or archive GCash payment QR codes.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  sensitive = EXCLUDED.sensitive,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO public.staff_role_definitions (
  id, key, name, description, "builtIn", "builtInKey", "allAccess", status, "archivedAt", "createdAt", "updatedAt"
) VALUES
  (
    'role_super_admin',
    'super_admin',
    'Super Admin',
    'Unrestricted admin access. Protected built-in; not editable or deletable.',
    true, 'super_admin', true, 'ACTIVE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'role_front_desk',
    'front_desk',
    'Front Desk',
    'Day-to-day booking and attendance operations without privileged settings, staff administration, coach compensation, refunds, or business reports.',
    true, 'front_desk', false, 'ACTIVE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ),
  (
    'role_coach',
    'coach',
    'Coach',
    'Only the signed-in coach’s own schedule, rosters, and attendance. Requires a linked coach profile. Does not replace isCoach.',
    true, 'coach', false, 'ACTIVE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "builtIn" = true,
  "builtInKey" = EXCLUDED."builtInKey",
  "allAccess" = EXCLUDED."allAccess",
  status = 'ACTIVE',
  "archivedAt" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP;

-- Super Admin snapshot of the current registry (all-access semantics still win in helpers).
INSERT INTO public.staff_role_permissions (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT
  'role_super_admin:' || p.key,
  'role_super_admin',
  p.id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM public.permission_definitions p
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO public.staff_role_permissions (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT
  'role_front_desk:' || k.key,
  'role_front_desk',
  k.key,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  VALUES
    ('dashboard.operations.read'),
    ('schedule.read.all'),
    ('roster.read.all'),
    ('attendance.manage.all'),
    ('bookings.read'),
    ('bookings.confirm'),
    ('bookings.reject'),
    ('payments.read'),
    ('payments.review'),
    ('payments.record_cash'),
    ('cancellations.read'),
    ('cancellations.manage'),
    ('reschedules.read'),
    ('reschedules.manage'),
    ('customers.read'),
    ('classes.read'),
    ('coaches.read')
) AS k(key)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO public.staff_role_permissions (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT
  'role_coach:' || k.key,
  'role_coach',
  k.key,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  VALUES
    ('dashboard.operations.read'),
    ('schedule.read.own'),
    ('roster.read.own'),
    ('attendance.manage.own')
) AS k(key)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Backfill: every existing staff row (including system actors) keeps its id/auth/coach/status.
-- Interactive ADMIN → Super Admin. System actors also receive the FK; is_admin() still excludes them.
UPDATE public.staff_members
SET "roleId" = 'role_super_admin',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "roleId" IS NULL;

ALTER TABLE public.staff_members
  ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE public.staff_members
  ALTER COLUMN "roleId" SET DEFAULT 'role_super_admin';

ALTER TABLE public.staff_members
  DROP CONSTRAINT IF EXISTS "staff_members_roleId_fkey";
ALTER TABLE public.staff_members
  ADD CONSTRAINT "staff_members_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES public.staff_role_definitions(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS staff_members_roleId_idx
  ON public.staff_members ("roleId");

COMMENT ON COLUMN public.staff_members."roleId" IS
  '#298 authorization role FK. Leftover staff_role enum is not truth and is not dropped in this wave.';
COMMENT ON TABLE public.staff_members IS
  'BE-003 / #298 staff principal. Authorization is roleId + permissions. isSystem rows are job actors and never pass is_admin()/has_permission. Coach teaching stays coaches.staffMemberId.';

COMMIT;
