/**
 * Canonical staff permission registry for epic #289 / ticket #294.
 * UI, mocks, API, and DB must import these keys — never invent permission strings.
 */

export const PERMISSION_CATEGORIES = [
  "schedule",
  "booking_operations",
  "catalogue",
  "reports",
  "administration",
] as const;

export type PermissionCategory = (typeof PERMISSION_CATEGORIES)[number];

export const PERMISSION_KEYS = [
  "dashboard.operations.read",
  "dashboard.financial.read",
  "schedule.read.all",
  "schedule.read.own",
  "schedule.create",
  "schedule.update",
  "schedule.cancel",
  "schedule.recurrence.manage",
  "events.read",
  "events.manage",
  "roster.read.all",
  "roster.read.own",
  "attendance.manage.all",
  "attendance.manage.own",
  "bookings.read",
  "bookings.confirm",
  "bookings.reject",
  "payments.read",
  "payments.review",
  "payments.record_cash",
  "refunds.read",
  "refunds.manage",
  "cancellations.read",
  "cancellations.manage",
  "reschedules.read",
  "reschedules.manage",
  "customers.read",
  "classes.read",
  "classes.manage",
  "coaches.read",
  "coaches.manage",
  "coach_rates.read",
  "coach_rates.manage",
  "bundles.read",
  "bundles.manage",
  "reports.sales.read",
  "reports.capacity.read",
  "reports.coach_costs.read",
  "reports.session.read",
  "staff.read",
  "staff.manage",
  "roles.read",
  "roles.manage",
  "settings.content.manage",
  "settings.policies.manage",
  "settings.payment_qr.manage",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionDefinition = {
  key: PermissionKey;
  category: PermissionCategory;
  label: string;
  description: string;
  sensitive: boolean;
};

const PERMISSION_KEY_SET: ReadonlySet<string> = new Set(PERMISSION_KEYS);

export function isPermissionKey(value: unknown): value is PermissionKey {
  return typeof value === "string" && PERMISSION_KEY_SET.has(value);
}

export function parsePermissionKey(value: unknown): PermissionKey | null {
  return isPermissionKey(value) ? value : null;
}

/** Throws when the value is not a registry key. Downstream must not coerce unknown strings. */
export function assertPermissionKey(value: unknown): PermissionKey {
  if (isPermissionKey(value)) return value;
  throw new Error("Unknown permission key. Use the canonical registry.");
}

export function filterPermissionKeys(values: readonly unknown[]): PermissionKey[] {
  const keys: PermissionKey[] = [];
  for (const value of values) {
    if (isPermissionKey(value) && !keys.includes(value)) keys.push(value);
  }
  return keys;
}

function permission(
  key: PermissionKey,
  category: PermissionCategory,
  label: string,
  description: string,
  sensitive = false,
): PermissionDefinition {
  return { key, category, label, description, sensitive };
}

export const PERMISSION_REGISTRY: readonly PermissionDefinition[] = [
  permission(
    "dashboard.operations.read",
    "schedule",
    "Operational dashboard",
    "View operational dashboard counts, attention queues, and today’s schedule.",
  ),
  permission(
    "dashboard.financial.read",
    "schedule",
    "Financial dashboard",
    "View sales, refund, occupancy-value, and coach-cost dashboard figures.",
    true,
  ),
  permission(
    "schedule.read.all",
    "schedule",
    "Read all schedules",
    "View every scheduled session.",
  ),
  permission(
    "schedule.read.own",
    "schedule",
    "Read own schedule",
    "View sessions assigned to the signed-in staff member’s linked coach.",
  ),
  permission(
    "schedule.create",
    "schedule",
    "Create sessions",
    "Create one-off scheduled sessions.",
  ),
  permission("schedule.update", "schedule", "Update sessions", "Edit existing scheduled sessions."),
  permission("schedule.cancel", "schedule", "Cancel sessions", "Cancel a scheduled session."),
  permission(
    "schedule.recurrence.manage",
    "schedule",
    "Manage recurrence",
    "Duplicate sessions and manage recurrence rules.",
  ),
  permission(
    "events.read",
    "schedule",
    "Read events",
    "View session events, including drafts and internal notes.",
  ),
  permission(
    "events.manage",
    "schedule",
    "Manage events",
    "Create, edit, publish, cancel, or archive a session event. Does not change session price, capacity, or status.",
  ),
  permission("roster.read.all", "schedule", "Read all rosters", "View every session roster."),
  permission(
    "roster.read.own",
    "schedule",
    "Read own rosters",
    "View rosters for sessions assigned to the linked coach.",
  ),
  permission(
    "attendance.manage.all",
    "schedule",
    "Manage all attendance",
    "Check in and mark no-show on any session.",
  ),
  permission(
    "attendance.manage.own",
    "schedule",
    "Manage own attendance",
    "Check in and mark no-show on sessions assigned to the linked coach.",
  ),
  permission(
    "bookings.read",
    "booking_operations",
    "Read bookings",
    "View the booking queue and booking detail.",
  ),
  permission("bookings.confirm", "booking_operations", "Confirm bookings", "Confirm a booking."),
  permission("bookings.reject", "booking_operations", "Reject bookings", "Reject a booking."),
  permission("payments.read", "booking_operations", "Read payments", "View payment queues."),
  permission(
    "payments.review",
    "booking_operations",
    "Review payment proof",
    "Review GCash payment proof.",
  ),
  permission(
    "payments.record_cash",
    "booking_operations",
    "Record cash",
    "Record a pay-at-counter cash payment.",
  ),
  permission(
    "refunds.read",
    "booking_operations",
    "Read refunds",
    "View refund status and refund queues.",
    true,
  ),
  permission(
    "refunds.manage",
    "booking_operations",
    "Manage refunds",
    "Mark refunds pending or refunded.",
    true,
  ),
  permission(
    "cancellations.read",
    "booking_operations",
    "Read cancellations",
    "View cancellation requests.",
  ),
  permission(
    "cancellations.manage",
    "booking_operations",
    "Manage cancellations",
    "Complete or reject cancellation requests.",
  ),
  permission(
    "reschedules.read",
    "booking_operations",
    "Read reschedules",
    "View reschedule requests.",
  ),
  permission(
    "reschedules.manage",
    "booking_operations",
    "Manage reschedules",
    "Approve or reject reschedule requests.",
  ),
  permission(
    "customers.read",
    "booking_operations",
    "Read customers",
    "View the customer directory and detail.",
  ),
  permission("classes.read", "catalogue", "Read classes", "View the class catalogue."),
  permission("classes.manage", "catalogue", "Manage classes", "Create or edit classes."),
  permission(
    "coaches.read",
    "catalogue",
    "Read coaches",
    "View coach profiles without compensation rates.",
  ),
  permission(
    "coaches.manage",
    "catalogue",
    "Manage coaches",
    "Create or edit coach profiles (not rates).",
  ),
  permission(
    "coach_rates.read",
    "catalogue",
    "Read coach rates",
    "View coach compensation rates and session rate snapshots.",
    true,
  ),
  permission(
    "coach_rates.manage",
    "catalogue",
    "Manage coach rates",
    "Create or change coach compensation rates.",
    true,
  ),
  permission(
    "bundles.read",
    "catalogue",
    "Read bundles",
    "View the session-bundle catalogue and customer entitlements. Added after #289 for BE-058 routes.",
  ),
  permission(
    "bundles.manage",
    "catalogue",
    "Manage bundles",
    "Create, edit, publish, archive, grant, revoke, or review session bundles.",
  ),
  permission(
    "reports.sales.read",
    "reports",
    "Sales reports",
    "View sales overview and class performance revenue.",
    true,
  ),
  permission(
    "reports.capacity.read",
    "reports",
    "Capacity reports",
    "View occupancy and attendance-utilisation reports.",
  ),
  permission(
    "reports.coach_costs.read",
    "reports",
    "Coach-cost reports",
    "View coach-cost and contribution reports.",
    true,
  ),
  permission(
    "reports.session.read",
    "reports",
    "Session reports",
    "View session drill-downs, including revenue and coach cost.",
    true,
  ),
  permission(
    "staff.read",
    "administration",
    "Read staff",
    "View staff members and assignment summaries.",
    true,
  ),
  permission(
    "staff.manage",
    "administration",
    "Manage staff",
    "Create, update, disable, or link staff accounts.",
    true,
  ),
  permission(
    "roles.read",
    "administration",
    "Read roles",
    "View role definitions and permission matrices.",
    true,
  ),
  permission(
    "roles.manage",
    "administration",
    "Manage roles",
    "Create, clone, update, archive, or assign roles.",
    true,
  ),
  permission(
    "settings.content.manage",
    "administration",
    "Manage content settings",
    "Edit business, about, contact, and FAQ content.",
    true,
  ),
  permission(
    "settings.policies.manage",
    "administration",
    "Manage policies",
    "Create and promote policy document versions.",
    true,
  ),
  permission(
    "settings.payment_qr.manage",
    "administration",
    "Manage payment QR",
    "Upload, activate, or archive GCash payment QR codes.",
    true,
  ),
] as const satisfies readonly PermissionDefinition[];

type RegisteredPermissionKey = (typeof PERMISSION_REGISTRY)[number]["key"];
type _RegistryCoversAllKeys =
  Exclude<PermissionKey, RegisteredPermissionKey> extends never ? true : never;
const _registryCoversAllKeys: _RegistryCoversAllKeys = true;
void _registryCoversAllKeys;

const REGISTRY_BY_KEY = Object.fromEntries(
  PERMISSION_REGISTRY.map((item) => [item.key, item]),
) as Record<PermissionKey, PermissionDefinition>;

export function permissionDefinition(key: PermissionKey): PermissionDefinition {
  return REGISTRY_BY_KEY[key];
}

export function permissionLabel(key: PermissionKey): string {
  return REGISTRY_BY_KEY[key].label;
}

export function permissionsInCategory(category: PermissionCategory): PermissionDefinition[] {
  return PERMISSION_REGISTRY.filter((item) => item.category === category);
}

export function groupedPermissionRegistry(): Record<PermissionCategory, PermissionDefinition[]> {
  return {
    schedule: permissionsInCategory("schedule"),
    booking_operations: permissionsInCategory("booking_operations"),
    catalogue: permissionsInCategory("catalogue"),
    reports: permissionsInCategory("reports"),
    administration: permissionsInCategory("administration"),
  };
}

export const PERMISSION_CATEGORY_LABELS: Record<PermissionCategory, string> = {
  schedule: "Schedule",
  booking_operations: "Booking operations",
  catalogue: "Catalogue",
  reports: "Reports",
  administration: "Administration",
};

export const SENSITIVE_PERMISSION_KEYS: readonly PermissionKey[] = PERMISSION_REGISTRY.filter(
  (item) => item.sensitive,
).map((item) => item.key);

export function isSensitivePermission(key: PermissionKey): boolean {
  return REGISTRY_BY_KEY[key].sensitive;
}

export function sensitivePermissionsOf(keys: readonly PermissionKey[]): PermissionKey[] {
  return keys.filter(isSensitivePermission);
}

/** Own-scope never implies the matching all-scope key. */
export const OWN_TO_ALL_PERMISSION: Readonly<Partial<Record<PermissionKey, PermissionKey>>> = {
  "schedule.read.own": "schedule.read.all",
  "roster.read.own": "roster.read.all",
  "attendance.manage.own": "attendance.manage.all",
};
