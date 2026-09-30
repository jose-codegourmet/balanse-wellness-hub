-- Expand the protected Front Desk built-in role with the explicitly approved
-- sensitive and operational permissions. This is forward-only: existing
-- databases already have the #298 built-in matrix trigger installed.

BEGIN;

ALTER TABLE public.staff_role_permissions
  DISABLE TRIGGER staff_role_permissions_builtin_guard;

INSERT INTO public.staff_role_permissions (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT
  'role_front_desk:' || permission.key,
  'role_front_desk',
  permission.id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM public.permission_definitions AS permission
WHERE permission.key IN (
  'dashboard.financial.read',
  'refunds.read',
  'refunds.manage',
  'coach_rates.read',
  'reports.coach_costs.read',
  'reports.session.read',
  'roles.read',
  'settings.content.manage'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

ALTER TABLE public.staff_role_permissions
  ENABLE TRIGGER staff_role_permissions_builtin_guard;

UPDATE public.permission_definitions
SET
  description = 'Edit business, about, contact, FAQ, pictures, updates, and news content.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE key = 'settings.content.manage';

UPDATE public.staff_role_definitions
SET
  description = 'Day-to-day booking, attendance, refund, financial reporting, coach-rate, role-audit, and content operations without staff or role administration.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE key = 'front_desk';

NOTIFY pgrst, 'reload schema';

COMMIT;
