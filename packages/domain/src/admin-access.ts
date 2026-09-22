/**
 * Single route/action/API → permission mapping consumed by nav, guards, and handlers.
 * Do not keep a second contradictory allow-list in UI or API tickets.
 */

import {
  hasAnyPermission,
  isInteractiveStaffActor,
  type StaffAuthorizationActor,
} from "./authorization";
import type { SettingsSection } from "./contracts";
import { ADMIN_NAV_ITEMS, type AdminNavId } from "./navigation";
import { OWN_TO_ALL_PERMISSION, type PermissionKey } from "./permissions";

export type AccessSurfaceKind = "nav" | "route" | "action" | "api";

export type AdminAccessQueryMatch = {
  key: string;
  values: readonly string[];
  /** Used when the query key is omitted (e.g. payments tab defaults to gcash). */
  defaultValue?: string;
};

export type AdminAccessRequirement = {
  id: string;
  kind: AccessSurfaceKind;
  label: string;
  anyOf: readonly PermissionKey[];
  navId?: AdminNavId;
  href?: string;
  /** Exact path or `:param` segments. */
  pathPattern?: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  requiresOwnership?: boolean;
  whenQuery?: AdminAccessQueryMatch;
  /**
   * Sensitive fields/sections on this mixed payload. Handlers must omit each
   * listed key’s data unless the actor also has that permission.
   */
  includeFieldsIf?: readonly PermissionKey[];
};

export const SETTINGS_SECTION_PERMISSIONS: Record<SettingsSection, PermissionKey> = {
  business: "settings.content.manage",
  content: "settings.content.manage",
  payment: "settings.payment_qr.manage",
  policies: "settings.policies.manage",
};

export const DASHBOARD_READ_PERMISSIONS = [
  "dashboard.operations.read",
  "dashboard.financial.read",
] as const satisfies readonly PermissionKey[];

export const SCHEDULE_READ_PERMISSIONS = [
  "schedule.read.all",
  "schedule.read.own",
] as const satisfies readonly PermissionKey[];

export const ROSTER_READ_PERMISSIONS = [
  "roster.read.all",
  "roster.read.own",
] as const satisfies readonly PermissionKey[];

export const ATTENDANCE_PERMISSIONS = [
  "attendance.manage.all",
  "attendance.manage.own",
] as const satisfies readonly PermissionKey[];

export const REPORT_READ_PERMISSIONS = [
  "reports.sales.read",
  "reports.capacity.read",
  "reports.coach_costs.read",
  "reports.session.read",
] as const satisfies readonly PermissionKey[];

export const SETTINGS_MANAGE_PERMISSIONS = [
  "settings.content.manage",
  "settings.policies.manage",
  "settings.payment_qr.manage",
] as const satisfies readonly PermissionKey[];

const CLASS_READ = ["classes.read", "classes.manage"] as const satisfies readonly PermissionKey[];
const COACH_READ = ["coaches.read", "coaches.manage"] as const satisfies readonly PermissionKey[];
const BUNDLE_READ = ["bundles.read", "bundles.manage"] as const satisfies readonly PermissionKey[];
const STAFF_READ = ["staff.read", "staff.manage"] as const satisfies readonly PermissionKey[];
const ROLE_READ = ["roles.read", "roles.manage"] as const satisfies readonly PermissionKey[];

function nav(
  navId: AdminNavId,
  href: string,
  label: string,
  anyOf: readonly PermissionKey[],
): AdminAccessRequirement {
  return { id: `nav:${navId}`, kind: "nav", navId, href, pathPattern: href, label, anyOf };
}

function route(
  id: string,
  pathPattern: string,
  label: string,
  anyOf: readonly PermissionKey[],
  extra?: Partial<AdminAccessRequirement>,
): AdminAccessRequirement {
  return {
    id: `route:${id}`,
    kind: "route",
    pathPattern,
    href: pathPattern,
    label,
    anyOf,
    ...extra,
  };
}

function action(
  id: string,
  label: string,
  anyOf: readonly PermissionKey[],
  extra?: Partial<AdminAccessRequirement>,
): AdminAccessRequirement {
  return { id: `action:${id}`, kind: "action", label, anyOf, ...extra };
}

function api(
  method: AdminAccessRequirement["method"],
  pathPattern: string,
  label: string,
  anyOf: readonly PermissionKey[],
  extra?: Partial<AdminAccessRequirement>,
): AdminAccessRequirement {
  return {
    id: `api:${method}:${pathPattern}`,
    kind: "api",
    method,
    pathPattern,
    label,
    anyOf,
    ...extra,
  };
}

export const ADMIN_NAV_ACCESS: readonly AdminAccessRequirement[] = [
  nav("dashboard", "/dashboard", "Dashboard", DASHBOARD_READ_PERMISSIONS),
  nav("schedule", "/schedule", "Schedule", SCHEDULE_READ_PERMISSIONS),
  nav("bookings", "/bookings", "Bookings", ["bookings.read"]),
  nav("payments", "/payments", "Payments", ["payments.read", "refunds.read"]),
  nav("payment-qr", "/payment-qr", "Payment QR", ["settings.payment_qr.manage"]),
  nav("cancellations", "/cancellations", "Cancellations", ["cancellations.read"]),
  nav("reschedules", "/reschedules", "Reschedules", ["reschedules.read"]),
  nav("customers", "/customers", "Customers", ["customers.read"]),
  nav("coaches", "/coaches", "Coaches", COACH_READ),
  nav("classes", "/classes", "Classes", CLASS_READ),
  nav("bundles", "/bundles", "Bundles", BUNDLE_READ),
  nav("reports", "/reports", "Reports", REPORT_READ_PERMISSIONS),
  nav("staff", "/staff", "Staff", [...STAFF_READ, ...ROLE_READ]),
  nav("settings", "/settings", "Settings", SETTINGS_MANAGE_PERMISSIONS),
];

export const ADMIN_ROUTE_ACCESS: readonly AdminAccessRequirement[] = [
  route("login", "/login", "Admin login", []),
  route("dashboard", "/dashboard", "Dashboard", DASHBOARD_READ_PERMISSIONS, {
    navId: "dashboard",
    includeFieldsIf: ["dashboard.financial.read"],
  }),
  route("schedule", "/schedule", "Schedule", SCHEDULE_READ_PERMISSIONS, { navId: "schedule" }),
  route("schedule-new", "/schedule/new", "Create session", ["schedule.create"], {
    navId: "schedule",
  }),
  route(
    "schedule-duplicate",
    "/schedule/duplicate",
    "Duplicate sessions",
    ["schedule.recurrence.manage"],
    {
      navId: "schedule",
    },
  ),
  route(
    "schedule-recurrence",
    "/schedule/:sessionId/recurrence",
    "Session recurrence",
    ["schedule.recurrence.manage"],
    { navId: "schedule" },
  ),
  route("schedule-edit", "/schedule/:sessionId", "Edit session", ["schedule.update"], {
    navId: "schedule",
  }),
  route("roster", "/sessions/:sessionId/roster", "Session roster", ROSTER_READ_PERMISSIONS, {
    navId: "schedule",
    requiresOwnership: true,
  }),
  route("bookings", "/bookings", "Bookings", ["bookings.read"], { navId: "bookings" }),
  route("booking-detail", "/bookings/:bookingId", "Booking detail", ["bookings.read"], {
    navId: "bookings",
  }),
  route("payments", "/payments", "Payments", ["payments.read", "refunds.read"], {
    navId: "payments",
    includeFieldsIf: ["refunds.read"],
  }),
  route("payment-qr", "/payment-qr", "Payment QR", ["settings.payment_qr.manage"], {
    navId: "payment-qr",
  }),
  route("cancellations", "/cancellations", "Cancellations", ["cancellations.read"], {
    navId: "cancellations",
  }),
  route("reschedules", "/reschedules", "Reschedules", ["reschedules.read"], {
    navId: "reschedules",
  }),
  route("customers", "/customers", "Customers", ["customers.read"], { navId: "customers" }),
  route("customer-detail", "/customers/:customerId", "Customer detail", ["customers.read"], {
    navId: "customers",
  }),
  route("coaches-new", "/coaches/new", "Create coach", ["coaches.manage"], { navId: "coaches" }),
  route("coaches", "/coaches", "Coaches", COACH_READ, {
    navId: "coaches",
    includeFieldsIf: ["coach_rates.read"],
  }),
  route("coach-detail", "/coaches/:coachId", "Coach detail", COACH_READ, {
    navId: "coaches",
    includeFieldsIf: ["coach_rates.read"],
  }),
  route("classes-new", "/classes/new", "Create class", ["classes.manage"], { navId: "classes" }),
  route("classes", "/classes", "Classes", CLASS_READ, { navId: "classes" }),
  route("class-detail", "/classes/:classId", "Class detail", CLASS_READ, { navId: "classes" }),
  route("bundles-new", "/bundles/new", "Create bundle", ["bundles.manage"], { navId: "bundles" }),
  route("bundles", "/bundles", "Bundles", BUNDLE_READ, { navId: "bundles" }),
  route("bundle-detail", "/bundles/:bundleId", "Bundle detail", BUNDLE_READ, { navId: "bundles" }),
  route("reports", "/reports", "Reports", REPORT_READ_PERMISSIONS, {
    navId: "reports",
    includeFieldsIf: REPORT_READ_PERMISSIONS,
  }),
  route("report-session", "/reports/:sessionId", "Session report", ["reports.session.read"], {
    navId: "reports",
  }),
  route("staff-roles-new", "/staff/roles/new", "Create role", ["roles.manage"], { navId: "staff" }),
  route("staff-role-detail", "/staff/roles/:roleId", "Role detail", ROLE_READ, { navId: "staff" }),
  route("staff-roles", "/staff/roles", "Roles", ROLE_READ, { navId: "staff" }),
  route("staff", "/staff", "Staff", STAFF_READ, { navId: "staff" }),
  route("staff-detail", "/staff/:staffId", "Staff detail", STAFF_READ, { navId: "staff" }),
  route(
    "settings-content-faqs",
    "/settings/content/faqs",
    "FAQ settings",
    ["settings.content.manage"],
    {
      navId: "settings",
    },
  ),
  route(
    "settings-content-about",
    "/settings/content/about-page",
    "About-page settings",
    ["settings.content.manage"],
    { navId: "settings" },
  ),
  route(
    "settings-content-contact",
    "/settings/content/contact",
    "Contact settings",
    ["settings.content.manage"],
    {
      navId: "settings",
    },
  ),
  route("settings-content", "/settings/content", "Content settings", ["settings.content.manage"], {
    navId: "settings",
  }),
  route(
    "settings-policies-new",
    "/settings/policies/new",
    "Create policy",
    ["settings.policies.manage"],
    {
      navId: "settings",
    },
  ),
  route(
    "settings-policy-detail",
    "/settings/policies/:policyId",
    "Policy detail",
    ["settings.policies.manage"],
    {
      navId: "settings",
    },
  ),
  route("settings-policies", "/settings/policies", "Policies", ["settings.policies.manage"], {
    navId: "settings",
  }),
  route("settings", "/settings", "Settings", SETTINGS_MANAGE_PERMISSIONS, { navId: "settings" }),
];

export const ADMIN_ACTION_ACCESS: readonly AdminAccessRequirement[] = [
  action("dashboard-financial", "Financial dashboard cards", ["dashboard.financial.read"]),
  action("dashboard-operations", "Operational dashboard cards", ["dashboard.operations.read"]),
  action("schedule-cancel", "Cancel session", ["schedule.cancel"]),
  action("schedule-create", "Create session", ["schedule.create"]),
  action("schedule-update", "Update session", ["schedule.update"]),
  action("schedule-recurrence", "Manage recurrence or duplicate", ["schedule.recurrence.manage"]),
  action("roster-read", "Open roster", ROSTER_READ_PERMISSIONS, { requiresOwnership: true }),
  action("attendance", "Check-in or no-show", ATTENDANCE_PERMISSIONS, { requiresOwnership: true }),
  action("bookings-confirm", "Confirm booking", ["bookings.confirm"]),
  action("bookings-reject", "Reject booking", ["bookings.reject"]),
  action("payments-review", "Review payment proof", ["payments.review"]),
  action("payments-record-cash", "Record cash", ["payments.record_cash"]),
  action("refunds-read", "View refund data", ["refunds.read"]),
  action("refunds-manage", "Manage refunds", ["refunds.manage"]),
  action("cancellations-manage", "Complete or reject cancellation", ["cancellations.manage"]),
  action("reschedules-manage", "Approve or reject reschedule", ["reschedules.manage"]),
  action("classes-manage", "Create or edit class", ["classes.manage"]),
  action("coaches-manage", "Create or edit coach", ["coaches.manage"]),
  action("coach-rates-read", "View coach rates", ["coach_rates.read"]),
  action("coach-rates-manage", "Edit coach rates", ["coach_rates.manage"]),
  action("bundles-manage", "Create, edit, grant, or review bundles", ["bundles.manage"]),
  action("reports-sales", "Sales report section", ["reports.sales.read"]),
  action("reports-capacity", "Capacity report section", ["reports.capacity.read"]),
  action("reports-coach-costs", "Coach-cost report section", ["reports.coach_costs.read"]),
  action("reports-session", "Session report section", ["reports.session.read"]),
  action("staff-manage", "Create, edit, disable, or link staff", ["staff.manage"]),
  action("roles-manage", "Create, clone, update, archive, or assign roles", ["roles.manage"]),
  action("settings-content", "Save content settings", ["settings.content.manage"]),
  action("settings-policies", "Promote or edit policies", ["settings.policies.manage"]),
  action("settings-payment-qr", "Manage payment QR", ["settings.payment_qr.manage"]),
];

export const ADMIN_API_ACCESS: readonly AdminAccessRequirement[] = [
  api("GET", "/api/admin/dashboard", "Dashboard snapshot", DASHBOARD_READ_PERMISSIONS, {
    includeFieldsIf: ["dashboard.financial.read"],
  }),
  api("GET", "/api/admin/dashboard/metrics", "Dashboard metrics", ["dashboard.financial.read"]),
  api("GET", "/api/admin/sessions", "List sessions", SCHEDULE_READ_PERMISSIONS, {
    requiresOwnership: true,
  }),
  api("POST", "/api/admin/sessions", "Create session", ["schedule.create"]),
  api("POST", "/api/admin/sessions/duplicate", "Duplicate sessions", [
    "schedule.recurrence.manage",
  ]),
  api("PATCH", "/api/admin/sessions/:id", "Update session", ["schedule.update"]),
  api("POST", "/api/admin/sessions/:id/recurrence", "Session recurrence", [
    "schedule.recurrence.manage",
  ]),
  api("POST", "/api/admin/sessions/:id/cancel", "Cancel session", ["schedule.cancel"]),
  api("GET", "/api/admin/sessions/:id/roster", "Session roster", ROSTER_READ_PERMISSIONS, {
    requiresOwnership: true,
  }),
  api("POST", "/api/admin/sessions/:id/check-in", "Check in", ATTENDANCE_PERMISSIONS, {
    requiresOwnership: true,
  }),
  api("POST", "/api/admin/sessions/:id/no-show", "Mark no-show", ATTENDANCE_PERMISSIONS, {
    requiresOwnership: true,
  }),
  api("GET", "/api/admin/bookings", "List bookings", ["bookings.read"]),
  api("POST", "/api/admin/bookings/:id/confirm", "Confirm booking", ["bookings.confirm"]),
  api("POST", "/api/admin/bookings/:id/reject", "Reject booking", ["bookings.reject"]),
  api("GET", "/api/admin/payments", "Payment queues (gcash/counter)", ["payments.read"], {
    whenQuery: { key: "tab", values: ["gcash", "counter"], defaultValue: "gcash" },
  }),
  api("GET", "/api/admin/payments", "Refund queue", ["refunds.read"], {
    id: "api:GET:/api/admin/payments?tab=refunds",
    whenQuery: { key: "tab", values: ["refunds"] },
  }),
  api("GET", "/api/admin/payment-proofs/:id/signed-url", "Payment proof", ["payments.review"]),
  api("POST", "/api/admin/payments/:id/record-cash", "Record cash", ["payments.record_cash"]),
  api("POST", "/api/admin/refunds/:id/mark-pending", "Mark refund pending", ["refunds.manage"]),
  api("POST", "/api/admin/refunds/:id/mark-refunded", "Mark refunded", ["refunds.manage"]),
  api("GET", "/api/admin/cancellation-requests", "Cancellation queue", ["cancellations.read"]),
  api("POST", "/api/admin/cancellation-requests/:id/complete", "Complete cancellation", [
    "cancellations.manage",
  ]),
  api("POST", "/api/admin/cancellation-requests/:id/reject", "Reject cancellation", [
    "cancellations.manage",
  ]),
  api("GET", "/api/admin/reschedule-requests", "Reschedule queue", ["reschedules.read"]),
  api("POST", "/api/admin/reschedule-requests/:id/approve", "Approve reschedule", [
    "reschedules.manage",
  ]),
  api("POST", "/api/admin/reschedule-requests/:id/reject", "Reject reschedule", [
    "reschedules.manage",
  ]),
  api("GET", "/api/admin/customers", "List customers", ["customers.read"]),
  api("GET", "/api/admin/customers/:id", "Customer detail", ["customers.read"]),
  api("GET", "/api/admin/classes", "List classes", CLASS_READ),
  api("POST", "/api/admin/classes", "Create class", ["classes.manage"]),
  api("PATCH", "/api/admin/classes/:id", "Update class", ["classes.manage"]),
  api("GET", "/api/admin/coaches", "List coaches", COACH_READ, {
    includeFieldsIf: ["coach_rates.read"],
  }),
  api("POST", "/api/admin/coaches", "Create coach", ["coaches.manage"], {
    includeFieldsIf: ["coach_rates.manage"],
  }),
  api("PATCH", "/api/admin/coaches/:id", "Update coach", ["coaches.manage"], {
    includeFieldsIf: ["coach_rates.manage"],
  }),
  api("POST", "/api/admin/coaches/:id/photo", "Upload coach photo", ["coaches.manage"]),
  api("DELETE", "/api/admin/coaches/:id/photo", "Remove coach photo", ["coaches.manage"]),
  api("GET", "/api/admin/bundles", "List bundles", BUNDLE_READ),
  api("POST", "/api/admin/bundles", "Create bundle", ["bundles.manage"]),
  api("GET", "/api/admin/bundles/:id", "Bundle detail", BUNDLE_READ),
  api("PATCH", "/api/admin/bundles/:id", "Update bundle", ["bundles.manage"]),
  api("POST", "/api/admin/bundles/:id/publish", "Publish bundle", ["bundles.manage"]),
  api("POST", "/api/admin/bundles/:id/unpublish", "Unpublish bundle", ["bundles.manage"]),
  api("POST", "/api/admin/bundles/:id/archive", "Archive bundle", ["bundles.manage"]),
  api("GET", "/api/admin/customers/:id/packages", "Customer packages", BUNDLE_READ),
  api("POST", "/api/admin/customers/:id/packages/grant", "Grant package", ["bundles.manage"]),
  api("POST", "/api/admin/packages/:id/revoke", "Revoke package", ["bundles.manage"]),
  api("GET", "/api/admin/package-acquisitions", "Package acquisitions", BUNDLE_READ),
  api("POST", "/api/admin/package-acquisitions/:id/approve", "Approve acquisition", [
    "bundles.manage",
  ]),
  api("POST", "/api/admin/package-acquisitions/:id/reject", "Reject acquisition", [
    "bundles.manage",
  ]),
  api("GET", "/api/admin/packages/:id/redemptions", "Package redemptions", BUNDLE_READ),
  api("GET", "/api/admin/reports/sales-overview", "Sales overview", ["reports.sales.read"]),
  api(
    "GET",
    "/api/admin/reports/class-performance",
    "Class performance",
    ["reports.sales.read", "reports.capacity.read"],
    {
      includeFieldsIf: ["reports.sales.read", "reports.capacity.read"],
    },
  ),
  api("GET", "/api/admin/reports/coach-costs", "Coach costs", ["reports.coach_costs.read"]),
  api("GET", "/api/admin/reports/session-performance", "Session performance", [
    "reports.session.read",
  ]),
  api("GET", "/api/admin/reports/sessions/:id", "Session report", ["reports.session.read"]),
  api("GET", "/api/admin/staff", "List staff", STAFF_READ),
  api("POST", "/api/admin/staff", "Create staff", ["staff.manage"]),
  api("PATCH", "/api/admin/staff/:id", "Update staff", ["staff.manage"]),
  api("POST", "/api/admin/staff/:id/disable", "Disable staff", ["staff.manage"]),
  api("POST", "/api/admin/staff/:id/coach", "Link coach", ["staff.manage"]),
  api("DELETE", "/api/admin/staff/:id/coach", "Unlink coach", ["staff.manage"]),
  api("POST", "/api/admin/staff/:id/role", "Assign staff role", ["roles.manage"]),
  api("GET", "/api/admin/permissions", "Permission registry", ROLE_READ),
  api("GET", "/api/admin/roles", "List roles", ROLE_READ),
  api("POST", "/api/admin/roles", "Create role", ["roles.manage"]),
  api("GET", "/api/admin/roles/:id", "Role detail", ROLE_READ),
  api("PATCH", "/api/admin/roles/:id", "Update role", ["roles.manage"]),
  api("POST", "/api/admin/roles/:id/clone", "Clone role", ["roles.manage"]),
  api("POST", "/api/admin/roles/:id/archive", "Archive role", ["roles.manage"]),
  api("GET", "/api/admin/settings", "Read settings", SETTINGS_MANAGE_PERMISSIONS, {
    includeFieldsIf: SETTINGS_MANAGE_PERMISSIONS,
  }),
  api("PATCH", "/api/admin/settings", "Patch settings", SETTINGS_MANAGE_PERMISSIONS, {
    includeFieldsIf: SETTINGS_MANAGE_PERMISSIONS,
  }),
  api("POST", "/api/admin/settings/qr", "Legacy settings QR create", [
    "settings.payment_qr.manage",
  ]),
  api("DELETE", "/api/admin/settings/qr", "Legacy settings QR delete", [
    "settings.payment_qr.manage",
  ]),
  api("GET", "/api/admin/settings/payment-qrs", "List payment QRs", ["settings.payment_qr.manage"]),
  api("POST", "/api/admin/settings/payment-qrs", "Create payment QR", [
    "settings.payment_qr.manage",
  ]),
  api("PATCH", "/api/admin/settings/payment-qrs/:id", "Update payment QR", [
    "settings.payment_qr.manage",
  ]),
  api("POST", "/api/admin/settings/payment-qrs/:id/activate", "Activate payment QR", [
    "settings.payment_qr.manage",
  ]),
  api("DELETE", "/api/admin/settings/payment-qrs/:id", "Archive payment QR", [
    "settings.payment_qr.manage",
  ]),
  api("POST", "/api/admin/settings/faqs", "Create FAQ", ["settings.content.manage"]),
  api("PATCH", "/api/admin/settings/faqs/:id", "Update FAQ", ["settings.content.manage"]),
  api("DELETE", "/api/admin/settings/faqs/:id", "Delete FAQ", ["settings.content.manage"]),
  api("POST", "/api/admin/settings/faqs/reorder", "Reorder FAQs", ["settings.content.manage"]),
  api("POST", "/api/admin/settings/policies/:id/promote", "Promote policy", [
    "settings.policies.manage",
  ]),
];

export const ADMIN_ACCESS_REQUIREMENTS: readonly AdminAccessRequirement[] = [
  ...ADMIN_NAV_ACCESS,
  ...ADMIN_ROUTE_ACCESS,
  ...ADMIN_ACTION_ACCESS,
  ...ADMIN_API_ACCESS,
];

export function pathMatchesPattern(pathname: string, pattern: string): boolean {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(":") || part === pathParts[index]);
}

function patternSpecificity(pattern: string): number {
  return pattern.split("/").reduce((score, part) => {
    if (!part) return score;
    return score + (part.startsWith(":") ? 1 : 10);
  }, 0);
}

export function matchAdminRouteAccess(pathname: string): AdminAccessRequirement | null {
  const routes = ADMIN_ROUTE_ACCESS.filter((item) => item.pathPattern);
  const ranked = [...routes].sort(
    (a, b) => patternSpecificity(b.pathPattern ?? "") - patternSpecificity(a.pathPattern ?? ""),
  );
  return (
    ranked.find((item) => item.pathPattern && pathMatchesPattern(pathname, item.pathPattern)) ??
    null
  );
}

export function accessQueryMatches(
  requirement: Pick<AdminAccessRequirement, "whenQuery">,
  query?: Record<string, string | undefined> | URLSearchParams | null,
): boolean {
  if (!requirement.whenQuery) return true;
  const raw = query
    ? query instanceof URLSearchParams
      ? (query.get(requirement.whenQuery.key) ?? undefined)
      : query[requirement.whenQuery.key]
    : undefined;
  const value = raw && raw.length > 0 ? raw : requirement.whenQuery.defaultValue;
  if (value == null) return false;
  return requirement.whenQuery.values.includes(value);
}

export function matchAdminApiAccess(
  method: string,
  pathname: string,
  query?: Record<string, string | undefined> | URLSearchParams | null,
): AdminAccessRequirement | null {
  const normalized = method.toUpperCase();
  const matches = ADMIN_API_ACCESS.filter(
    (item) =>
      item.method === normalized &&
      item.pathPattern &&
      pathMatchesPattern(pathname, item.pathPattern) &&
      accessQueryMatches(item, query),
  );
  return matches.find((item) => item.whenQuery) ?? matches[0] ?? null;
}

export function actorSatisfiesAccess(
  actor: StaffAuthorizationActor | null | undefined,
  requirement: Pick<AdminAccessRequirement, "anyOf">,
): boolean {
  if (requirement.anyOf.length === 0) return true;
  return hasAnyPermission(actor, requirement.anyOf);
}

/**
 * Permission plus optional own-scope ownership.
 * `ownsResource` omitted means “may open the surface”; pass `false` to deny a
 * specific row the actor does not own.
 */
export function actorSatisfiesRequirement(
  actor: StaffAuthorizationActor | null | undefined,
  requirement: AdminAccessRequirement,
  context: { ownsResource?: boolean } = {},
): boolean {
  if (requirement.anyOf.length === 0) return true;
  if (!requirement.requiresOwnership) return actorSatisfiesAccess(actor, requirement);

  const allKeys = requirement.anyOf.filter((key) => !(key in OWN_TO_ALL_PERMISSION));
  const ownKeys = requirement.anyOf.filter((key) => key in OWN_TO_ALL_PERMISSION);
  if (hasAnyPermission(actor, allKeys)) return true;
  if (!hasAnyPermission(actor, ownKeys)) return false;
  if (!isInteractiveStaffActor(actor) || !actor?.coachId) return false;
  return context.ownsResource !== false;
}

export function permittedAdminNavItems(
  actor: StaffAuthorizationActor | null | undefined,
): (typeof ADMIN_NAV_ITEMS)[number][] {
  return ADMIN_NAV_ITEMS.filter((item) => {
    const requirement = ADMIN_NAV_ACCESS.find((entry) => entry.navId === item.id);
    return requirement ? actorSatisfiesRequirement(actor, requirement) : false;
  });
}

/** Prefer a route the actor can actually open, not just a parent nav href. */
export const ADMIN_LANDING_PATHS = [
  "/dashboard",
  "/schedule",
  "/bookings",
  "/payments",
  "/payment-qr",
  "/cancellations",
  "/reschedules",
  "/customers",
  "/coaches",
  "/classes",
  "/bundles",
  "/reports",
  "/staff",
  "/staff/roles",
  "/settings",
] as const;

export function previewActorForPermissions(
  keys: readonly PermissionKey[],
): StaffAuthorizationActor {
  return {
    userId: "preview",
    staffId: "preview",
    staffStatus: "active",
    roleId: "preview",
    roleKey: "custom_preview",
    roleActive: true,
    permissions: keys,
    coachId: "preview-coach",
    isCoach: true,
  };
}

export function accessibleAdminPagesForPermissions(
  keys: readonly PermissionKey[],
): { href: string; label: string }[] {
  const actor = previewActorForPermissions(keys);
  return ADMIN_NAV_ACCESS.filter((requirement) =>
    actorSatisfiesRequirement(actor, requirement),
  ).map((requirement) => ({
    href: requirement.href ?? "",
    label: requirement.label,
  }));
}

export function firstPermittedAdminRoute(
  actor: StaffAuthorizationActor | null | undefined,
  fallback: string | null = null,
): string | null {
  for (const href of ADMIN_LANDING_PATHS) {
    const requirement = matchAdminRouteAccess(href);
    if (requirement && actorSatisfiesRequirement(actor, requirement)) return href;
  }
  return fallback;
}

export function adminNavRequiredPermissions(navId: AdminNavId): readonly PermissionKey[] {
  return ADMIN_NAV_ACCESS.find((item) => item.navId === navId)?.anyOf ?? [];
}
