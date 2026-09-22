/**
 * Pure staff-authorization helpers. Server enforcement is canonical; these
 * helpers are the shared deny-by-default rules for API, mock, and UI.
 */

import { isPermissionKey, PERMISSION_KEYS, type PermissionKey } from "./permissions";
import { type BuiltInRoleKey, coachRoleRequiresLinkedCoach, isSuperAdminRoleKey } from "./roles";

export type StaffMemberStatus = "active" | "disabled";

/**
 * Request-scoped staff actor. Role key/id is authorization truth.
 * `isCoach` / `coachId` remain the teaching relationship (BE-055), not a role.
 */
export type StaffAuthorizationActor = {
  userId: string;
  staffId: string;
  staffStatus: StaffMemberStatus;
  roleId: string;
  roleKey: string;
  roleActive: boolean;
  permissions: readonly PermissionKey[];
  /** Linked Coach.id when this staff member teaches. Never inferred from name/email. */
  coachId: string | null;
  /** Derived from the coach link. Not an authorization role. */
  isCoach: boolean;
  email?: string | null;
  isSystem?: boolean;
};

export const AUTHORIZATION_INVARIANTS = {
  denyByDefault:
    "Missing role/permission, disabled role/staff, system actor, or unresolved coach ownership means no access.",
  serverIsCanonical: "Client permission checks are UX only. Server authorization is canonical.",
  ownDoesNotImplyAll: "Own-scope never implies all-scope.",
  sensitiveDataExplicit:
    "Rates, costs, sales, refund totals, and financial reports need explicit sensitive permissions.",
  lastSuperAdmin:
    "The last active non-system Super Admin cannot be disabled, demoted, deleted, or stripped of all-access behavior.",
  coachLinkIsNotARole:
    "Authorization role is separate from derived isCoach/coachId. Never infer permissions from a public Coach row.",
  coachRoleNeedsProfile:
    "The built-in Coach role requires a linked coach profile because own-scope cannot otherwise be resolved.",
} as const;

export type LastSuperAdminProtectedAction = "disable" | "demote" | "delete" | "strip_all_access";

export function isInteractiveStaffActor(
  actor: StaffAuthorizationActor | null | undefined,
): boolean {
  if (!actor) return false;
  if (actor.isSystem) return false;
  if (actor.staffStatus !== "active") return false;
  if (!actor.roleActive) return false;
  if (!actor.staffId || !actor.roleId || !actor.roleKey) return false;
  return true;
}

export function hasPermission(
  actor: StaffAuthorizationActor | null | undefined,
  key: PermissionKey,
): boolean {
  if (!isInteractiveStaffActor(actor) || !actor) return false;
  if (isSuperAdminRoleKey(actor.roleKey)) return true;
  return actor.permissions.some((item) => item === key);
}

export function hasAnyPermission(
  actor: StaffAuthorizationActor | null | undefined,
  keys: readonly PermissionKey[],
): boolean {
  return keys.some((key) => hasPermission(actor, key));
}

export function hasAllPermissions(
  actor: StaffAuthorizationActor | null | undefined,
  keys: readonly PermissionKey[],
): boolean {
  return keys.length > 0 && keys.every((key) => hasPermission(actor, key));
}

export function actorPermissionSet(actor: StaffAuthorizationActor): ReadonlySet<PermissionKey> {
  if (!isInteractiveStaffActor(actor)) return new Set();
  if (isSuperAdminRoleKey(actor.roleKey)) return new Set(PERMISSION_KEYS);
  return new Set(actor.permissions.filter(isPermissionKey));
}

/**
 * Own-scope access. All-scope is a separate permission and is never implied.
 * Unresolved coach ownership denies own-scope even when the own key is present.
 */
export function hasScopedPermission(
  actor: StaffAuthorizationActor | null | undefined,
  ownKey: PermissionKey,
  allKey: PermissionKey,
  ownsResource: boolean,
): boolean {
  if (hasPermission(actor, allKey)) return true;
  if (!hasPermission(actor, ownKey)) return false;
  if (!actor?.coachId) return false;
  return ownsResource;
}

export function canGrantPermissions(
  actor: StaffAuthorizationActor | null | undefined,
  requested: readonly PermissionKey[],
): boolean {
  if (!isInteractiveStaffActor(actor) || !actor) return false;
  if (isSuperAdminRoleKey(actor.roleKey)) return true;
  return requested.every((key) => hasPermission(actor, key));
}

export function violatesLastSuperAdminInvariant(input: {
  targetHoldsSuperAdmin: boolean;
  /** Count of active non-system Super Admins, including the target. */
  remainingActiveSuperAdminCount: number;
  action: LastSuperAdminProtectedAction;
}): boolean {
  if (!input.targetHoldsSuperAdmin) return false;
  if (input.remainingActiveSuperAdminCount > 1) return false;
  return (
    input.action === "disable" ||
    input.action === "demote" ||
    input.action === "delete" ||
    input.action === "strip_all_access"
  );
}

export function roleAssignmentDeniedReason(input: {
  roleKey: string;
  roleActive: boolean;
  roleArchived: boolean;
  coachId: string | null;
}): string | null {
  if (input.roleArchived || !input.roleActive) {
    return "Archived or disabled roles cannot be assigned.";
  }
  if (coachRoleRequiresLinkedCoach(input.roleKey, input.coachId)) {
    return "The Coach role requires a linked coach profile.";
  }
  return null;
}

export function actorAuthorizationFingerprint(actor: StaffAuthorizationActor): string {
  return [actor.staffId, actor.roleId, actor.roleKey, [...actor.permissions].sort().join(",")].join(
    ":",
  );
}

export type BuiltInRoleAssignment = {
  roleKey: BuiltInRoleKey;
  coachId: string | null;
  isCoach: boolean;
};
