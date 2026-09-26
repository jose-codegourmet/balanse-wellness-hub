/**
 * Seeded Super Admin, Front Desk, and Coach matrices from #289.
 * Custom roles reuse these types; they never become a StaffRole enum.
 */

import { filterPermissionKeys, PERMISSION_KEYS, type PermissionKey } from "./permissions";

export const BUILT_IN_ROLE_KEYS = ["super_admin", "front_desk", "coach"] as const;
export type BuiltInRoleKey = (typeof BUILT_IN_ROLE_KEYS)[number];

export const SUPER_ADMIN_ROLE_KEY = "super_admin" satisfies BuiltInRoleKey;
export const FRONT_DESK_ROLE_KEY = "front_desk" satisfies BuiltInRoleKey;
export const COACH_ROLE_KEY = "coach" satisfies BuiltInRoleKey;

export type StaffRoleStatus = "active" | "archived";

export type StaffRoleDefinition = {
  key: string;
  name: string;
  description: string;
  builtIn: boolean;
  builtInKey: BuiltInRoleKey | null;
  status: StaffRoleStatus;
  /** Super Admin uses all-access semantics; this snapshot is the current registry. */
  allAccess: boolean;
  permissionKeys: readonly PermissionKey[];
};

export type AdminStaffRole = StaffRoleDefinition & {
  id: string;
  assignedStaffCount: number;
  permissionCount: number;
  cloneSourceId?: string | null;
  cloneSourceName?: string | null;
};

export const FRONT_DESK_PERMISSION_KEYS = [
  "dashboard.operations.read",
  "schedule.read.all",
  "roster.read.all",
  "attendance.manage.all",
  "bookings.read",
  "bookings.confirm",
  "bookings.reject",
  "payments.read",
  "payments.review",
  "payments.record_cash",
  "cancellations.read",
  "cancellations.manage",
  "reschedules.read",
  "reschedules.manage",
  "customers.read",
  "classes.read",
  "coaches.read",
  "events.read",
] as const satisfies readonly PermissionKey[];

export const COACH_PERMISSION_KEYS = [
  "dashboard.operations.read",
  "schedule.read.own",
  "roster.read.own",
  "attendance.manage.own",
] as const satisfies readonly PermissionKey[];

export const SUPER_ADMIN_PERMISSION_KEYS: readonly PermissionKey[] = PERMISSION_KEYS;

export const BUILT_IN_ROLE_DEFINITIONS: readonly StaffRoleDefinition[] = [
  {
    key: SUPER_ADMIN_ROLE_KEY,
    name: "Super Admin",
    description: "Unrestricted admin access. Protected built-in; not editable or deletable.",
    builtIn: true,
    builtInKey: SUPER_ADMIN_ROLE_KEY,
    status: "active",
    allAccess: true,
    permissionKeys: SUPER_ADMIN_PERMISSION_KEYS,
  },
  {
    key: FRONT_DESK_ROLE_KEY,
    name: "Front Desk",
    description:
      "Day-to-day booking and attendance operations without privileged settings, staff administration, coach compensation, refunds, or business reports.",
    builtIn: true,
    builtInKey: FRONT_DESK_ROLE_KEY,
    status: "active",
    allAccess: false,
    permissionKeys: FRONT_DESK_PERMISSION_KEYS,
  },
  {
    key: COACH_ROLE_KEY,
    name: "Coach",
    description:
      "Only the signed-in coach’s own schedule, rosters, and attendance. Requires a linked coach profile. Does not replace isCoach.",
    builtIn: true,
    builtInKey: COACH_ROLE_KEY,
    status: "active",
    allAccess: false,
    permissionKeys: COACH_PERMISSION_KEYS,
  },
] as const;

export const BUILT_IN_ROLE_LABELS: Record<BuiltInRoleKey, string> = {
  super_admin: "Super Admin",
  front_desk: "Front Desk",
  coach: "Coach",
};

export function isBuiltInRoleKey(value: unknown): value is BuiltInRoleKey {
  return (
    value === SUPER_ADMIN_ROLE_KEY || value === FRONT_DESK_ROLE_KEY || value === COACH_ROLE_KEY
  );
}

export function isSuperAdminRoleKey(value: string): boolean {
  return value === SUPER_ADMIN_ROLE_KEY;
}

/** Matches DB last-SA detection: all-access or built-in Super Admin key. */
export function roleHoldsSuperAdminAccess(
  role:
    | {
        key?: string | null;
        allAccess?: boolean | null;
        builtInKey?: string | null;
      }
    | null
    | undefined,
): boolean {
  if (!role) return false;
  if (role.allAccess) return true;
  if (role.builtInKey === SUPER_ADMIN_ROLE_KEY) return true;
  return Boolean(role.key && isSuperAdminRoleKey(role.key));
}

export function isCoachAuthorizationRole(roleKey: string): boolean {
  return roleKey === COACH_ROLE_KEY;
}

export function builtInRoleDefinition(key: BuiltInRoleKey): StaffRoleDefinition {
  const match = BUILT_IN_ROLE_DEFINITIONS.find((role) => role.key === key);
  if (!match) throw new Error(`Unknown built-in role: ${key}`);
  return match;
}

export function roleLabel(roleKey: string, displayName?: string): string {
  if (isBuiltInRoleKey(roleKey)) return BUILT_IN_ROLE_LABELS[roleKey];
  const name = displayName?.trim();
  return name || roleKey;
}

export function defaultPermissionsForRoleKey(roleKey: string): readonly PermissionKey[] {
  if (isSuperAdminRoleKey(roleKey)) return SUPER_ADMIN_PERMISSION_KEYS;
  if (roleKey === FRONT_DESK_ROLE_KEY) return FRONT_DESK_PERMISSION_KEYS;
  if (roleKey === COACH_ROLE_KEY) return COACH_PERMISSION_KEYS;
  return [];
}

export function resolveRolePermissions(
  role: Pick<StaffRoleDefinition, "allAccess" | "permissionKeys">,
): PermissionKey[] {
  if (role.allAccess) return [...PERMISSION_KEYS];
  return filterPermissionKeys(role.permissionKeys);
}

/** Custom roles cannot impersonate a built-in by key or display name. */
export function customRoleKeyFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function customRoleIdentityConflicts(name: string, key: string): boolean {
  const nameNorm = name.trim().toLowerCase();
  const keyNorm = key.trim().toLowerCase();
  if (!nameNorm || !keyNorm) return true;
  if (isBuiltInRoleKey(keyNorm)) return true;
  return BUILT_IN_ROLE_DEFINITIONS.some(
    (role) => role.name.toLowerCase() === nameNorm || role.key === nameNorm,
  );
}

export function isValidCustomPermissionSet(keys: readonly PermissionKey[]): boolean {
  return keys.length > 0 && keys.every((key, index) => keys.indexOf(key) === index);
}

/**
 * Assigning the built-in Coach authorization role requires a linked teaching profile.
 * Super Admin / Front Desk may also be coaches via isCoach — that is a separate check.
 */
export function coachRoleRequiresLinkedCoach(
  roleKey: string,
  coachId: string | null | undefined,
): boolean {
  if (!isCoachAuthorizationRole(roleKey)) return false;
  return !coachId;
}
