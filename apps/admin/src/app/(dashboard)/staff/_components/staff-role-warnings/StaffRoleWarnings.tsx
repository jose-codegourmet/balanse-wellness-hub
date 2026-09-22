import type { AdminStaffRole } from "@balanse/domain";
import {
  coachRoleRequiresLinkedCoach,
  hasPermission,
  isSuperAdminRoleKey,
  roleAssignmentDeniedReason,
  type StaffAuthorizationActor,
  violatesLastSuperAdminInvariant,
} from "@balanse/domain";

export type StaffRoleWarningsProps = {
  role?: AdminStaffRole | null;
  isCoach: boolean;
  coachId: string | null;
  targetStaffId?: string;
  targetIsActiveSuperAdmin: boolean;
  activeSuperAdminCount: number;
  actor: StaffAuthorizationActor | null;
};

export function staffRoleAssignmentBlockers(input: StaffRoleWarningsProps): string[] {
  const blockers: string[] = [];
  if (!input.role) {
    blockers.push("Select an authorization role.");
    return blockers;
  }
  const denied = roleAssignmentDeniedReason({
    roleKey: input.role.key,
    roleActive: input.role.status === "active",
    roleArchived: input.role.status === "archived",
    coachId: input.isCoach ? (input.coachId ?? "pending-link") : null,
  });
  if (
    denied &&
    coachRoleRequiresLinkedCoach(input.role.key, input.isCoach ? input.coachId : null)
  ) {
    if (!input.isCoach) {
      blockers.push(
        "The Coach role needs a linked teaching profile. Turn on “This staff member is a coach” before saving.",
      );
    }
  } else if (denied) {
    blockers.push(denied);
  }
  if (
    violatesLastSuperAdminInvariant({
      targetHoldsSuperAdmin: input.targetIsActiveSuperAdmin,
      remainingActiveSuperAdminCount: input.activeSuperAdminCount,
      action: "demote",
    }) &&
    !isSuperAdminRoleKey(input.role.key)
  ) {
    blockers.push("The last active Super Admin cannot be demoted to another role.");
  }
  if (
    input.actor &&
    input.targetStaffId &&
    input.actor.staffId === input.targetStaffId &&
    !hasPermission(
      { ...input.actor, roleKey: input.role.key, permissions: input.role.permissionKeys },
      "staff.manage",
    ) &&
    !isSuperAdminRoleKey(input.role.key)
  ) {
    blockers.push(
      "This change would lock you out of staff administration. Assign another Super Admin first, or pick a role that still includes staff.manage.",
    );
  }
  return blockers;
}

export function StaffRoleWarnings(props: StaffRoleWarningsProps) {
  const blockers = staffRoleAssignmentBlockers(props);
  if (blockers.length === 0) return null;
  return (
    <div className="space-y-2">
      {blockers.map((message) => (
        <p
          key={message}
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
        >
          {message}
        </p>
      ))}
    </div>
  );
}
