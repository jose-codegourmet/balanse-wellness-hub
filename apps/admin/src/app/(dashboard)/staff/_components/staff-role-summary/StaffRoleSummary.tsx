import {
  type AdminStaffRole,
  type PermissionKey,
  resolveRolePermissions,
  roleLabel,
} from "@balanse/domain";
import { RoleAccessSummary } from "../../roles/_components/role-access-summary/RoleAccessSummary";

export type StaffRoleSummaryProps = {
  role?: AdminStaffRole | null;
};

export function StaffRoleSummary({ role }: StaffRoleSummaryProps) {
  if (!role) {
    return (
      <p className="text-sm text-muted-foreground">Select a role to see what it can access.</p>
    );
  }

  const keys = resolveRolePermissions(role) as PermissionKey[];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{roleLabel(role.key, role.name)}</p>
        <p className="text-sm text-muted-foreground">{role.description}</p>
      </div>
      <RoleAccessSummary permissionKeys={keys} />
    </div>
  );
}
