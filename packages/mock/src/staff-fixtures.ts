import type {
  AdminStaff,
  PermissionKey,
  StaffAuthorizationActor,
  StaffRoleDefinition,
} from "@balanse/domain";
import {
  actorAuthorizationFingerprint,
  builtInRoleDefinition,
  COACH_ROLE_KEY,
  FRONT_DESK_PERMISSION_KEYS,
  FRONT_DESK_ROLE_KEY,
  filterPermissionKeys,
  resolveRolePermissions,
  SUPER_ADMIN_ROLE_KEY,
} from "@balanse/domain";

export const MOCK_STAFF_ROLE_IDS = {
  superAdmin: "role-super-admin",
  frontDesk: "role-front-desk",
  coach: "role-coach",
  communityHost: "role-community-host",
  contentEditor: "role-content-editor",
  roleAuditor: "role-role-auditor",
} as const;

/** Custom-role allow-list composed from the seeded Front Desk matrix — not a copied registry. */
export const COMMUNITY_HOST_PERMISSION_KEYS = FRONT_DESK_PERMISSION_KEYS.filter(
  (key) =>
    key === "dashboard.operations.read" ||
    key === "customers.read" ||
    key === "classes.read" ||
    key === "coaches.read",
);

export const CONTENT_EDITOR_PERMISSION_KEYS = [
  "settings.content.manage",
  "settings.policies.manage",
] as const satisfies readonly PermissionKey[];

export const ROLE_AUDITOR_PERMISSION_KEYS = [
  "roles.read",
] as const satisfies readonly PermissionKey[];

export type MockStaffRoleRecord = StaffRoleDefinition & {
  id: string;
  /** Bumps authorization fingerprints when a role matrix is edited in the harness. */
  revision: number;
  cloneSourceId?: string | null;
};

export const mockStaffRoles: readonly MockStaffRoleRecord[] = [
  {
    id: MOCK_STAFF_ROLE_IDS.superAdmin,
    revision: 1,
    ...builtInRoleDefinition(SUPER_ADMIN_ROLE_KEY),
  },
  {
    id: MOCK_STAFF_ROLE_IDS.frontDesk,
    revision: 1,
    ...builtInRoleDefinition(FRONT_DESK_ROLE_KEY),
  },
  {
    id: MOCK_STAFF_ROLE_IDS.coach,
    revision: 1,
    ...builtInRoleDefinition(COACH_ROLE_KEY),
  },
  {
    id: MOCK_STAFF_ROLE_IDS.communityHost,
    revision: 1,
    key: "community_host",
    name: "Community Host",
    description: "Custom mock role: operational welcome desk without booking or payment queues.",
    builtIn: false,
    builtInKey: null,
    status: "active",
    allAccess: false,
    permissionKeys: COMMUNITY_HOST_PERMISSION_KEYS,
  },
  {
    id: MOCK_STAFF_ROLE_IDS.contentEditor,
    revision: 1,
    key: "content_editor",
    name: "Content Editor",
    description: "Custom mock role: public website content and policy management only.",
    builtIn: false,
    builtInKey: null,
    status: "active",
    allAccess: false,
    permissionKeys: CONTENT_EDITOR_PERMISSION_KEYS,
  },
  {
    id: MOCK_STAFF_ROLE_IDS.roleAuditor,
    revision: 1,
    key: "role_auditor",
    name: "Role Auditor",
    description: "Custom mock role: read-only access to roles and permission matrices.",
    builtIn: false,
    builtInKey: null,
    status: "active",
    allAccess: false,
    permissionKeys: ROLE_AUDITOR_PERMISSION_KEYS,
  },
];

export const MOCK_STAFF_IDS = {
  rex: "staff-rex",
  partner: "staff-partner",
  coach: "staff-ephraim",
  disabled: "staff-disabled",
  custom: "staff-custom",
  contentEditor: "staff-content-editor",
  roleAuditor: "staff-role-auditor",
} as const;

export type MockStaffIdentityId = (typeof MOCK_STAFF_IDS)[keyof typeof MOCK_STAFF_IDS];

export type MockStaffIdentity = {
  id: MockStaffIdentityId;
  label: string;
  description: string;
  staffId: MockStaffIdentityId;
  roleId: string;
};

export const MOCK_STAFF_IDENTITIES: readonly MockStaffIdentity[] = [
  {
    id: MOCK_STAFF_IDS.rex,
    label: "Rex — Super Admin + coach",
    description: "Active Super Admin linked to coach-rex.",
    staffId: MOCK_STAFF_IDS.rex,
    roleId: MOCK_STAFF_ROLE_IDS.superAdmin,
  },
  {
    id: MOCK_STAFF_IDS.partner,
    label: "Partner — Front Desk",
    description: "Active Front Desk. Not a coach.",
    staffId: MOCK_STAFF_IDS.partner,
    roleId: MOCK_STAFF_ROLE_IDS.frontDesk,
  },
  {
    id: MOCK_STAFF_IDS.coach,
    label: "Ephraim — Coach role",
    description: "Active Coach-role staff linked to coach-ephraim.",
    staffId: MOCK_STAFF_IDS.coach,
    roleId: MOCK_STAFF_ROLE_IDS.coach,
  },
  {
    id: MOCK_STAFF_IDS.disabled,
    label: "Disabled staff",
    description: "Disabled Front Desk account. Distinct from guest/customer.",
    staffId: MOCK_STAFF_IDS.disabled,
    roleId: MOCK_STAFF_ROLE_IDS.frontDesk,
  },
  {
    id: MOCK_STAFF_IDS.custom,
    label: "Mia — Community Host",
    description: "Active custom-role staff. Not a coach.",
    staffId: MOCK_STAFF_IDS.custom,
    roleId: MOCK_STAFF_ROLE_IDS.communityHost,
  },
  {
    id: MOCK_STAFF_IDS.contentEditor,
    label: "Camille — Content Editor",
    description: "Active custom-role staff with public content and policy access only.",
    staffId: MOCK_STAFF_IDS.contentEditor,
    roleId: MOCK_STAFF_ROLE_IDS.contentEditor,
  },
  {
    id: MOCK_STAFF_IDS.roleAuditor,
    label: "Paolo — Role Auditor",
    description: "Active custom-role staff with read-only role catalogue access.",
    staffId: MOCK_STAFF_IDS.roleAuditor,
    roleId: MOCK_STAFF_ROLE_IDS.roleAuditor,
  },
];

function staffRow(
  id: MockStaffIdentityId,
  name: string,
  email: string,
  roleId: string,
  status: AdminStaff["status"],
  coachId: string | null,
): AdminStaff {
  const role = mockStaffRoles.find((item) => item.id === roleId);
  return {
    id,
    name,
    email,
    role: "ADMIN",
    roleId,
    roleKey: role?.key ?? "",
    roleName: role?.name ?? "",
    status,
    isCoach: Boolean(coachId),
    coachId,
  };
}

export const mockStaffMembers: AdminStaff[] = [
  staffRow(
    MOCK_STAFF_IDS.rex,
    "Rex Francis Regis",
    "rex@balanse.example",
    MOCK_STAFF_ROLE_IDS.superAdmin,
    "active",
    "coach-rex",
  ),
  staffRow(
    MOCK_STAFF_IDS.partner,
    "Studio Partner",
    "partner@balanse.example",
    MOCK_STAFF_ROLE_IDS.frontDesk,
    "active",
    null,
  ),
  staffRow(
    MOCK_STAFF_IDS.coach,
    "Ephraim Bacaltos",
    "ephraim@balanse.example",
    MOCK_STAFF_ROLE_IDS.coach,
    "active",
    "coach-ephraim",
  ),
  staffRow(
    MOCK_STAFF_IDS.disabled,
    "Inactive Coordinator",
    "disabled@balanse.example",
    MOCK_STAFF_ROLE_IDS.frontDesk,
    "disabled",
    null,
  ),
  staffRow(
    MOCK_STAFF_IDS.custom,
    "Mia Reyes",
    "mia@balanse.example",
    MOCK_STAFF_ROLE_IDS.communityHost,
    "active",
    null,
  ),
  staffRow(
    MOCK_STAFF_IDS.contentEditor,
    "Camille Flores",
    "camille@balanse.example",
    MOCK_STAFF_ROLE_IDS.contentEditor,
    "active",
    null,
  ),
  staffRow(
    MOCK_STAFF_IDS.roleAuditor,
    "Paolo Cruz",
    "paolo@balanse.example",
    MOCK_STAFF_ROLE_IDS.roleAuditor,
    "active",
    null,
  ),
];

const seedAssignments: Record<string, string> = Object.fromEntries(
  MOCK_STAFF_IDENTITIES.map((row) => [row.staffId, row.roleId]),
);

let liveRoles: MockStaffRoleRecord[] = mockStaffRoles.map((role) => structuredClone(role));
let liveAssignments: Record<string, string> = { ...seedAssignments };

export function resetMockStaffRoleStore(): void {
  liveRoles = mockStaffRoles.map((role) => structuredClone(role));
  liveAssignments = { ...seedAssignments };
}

export function listLiveMockStaffRoles(): MockStaffRoleRecord[] {
  return liveRoles.map((role) => structuredClone(role));
}

export function liveMockStaffRoleById(roleId: string): MockStaffRoleRecord | undefined {
  const role = liveRoles.find((item) => item.id === roleId);
  return role ? structuredClone(role) : undefined;
}

export function mockStaffRoleById(roleId: string): MockStaffRoleRecord | undefined {
  return liveMockStaffRoleById(roleId) ?? mockStaffRoles.find((role) => role.id === roleId);
}

export function assignedMockStaffCount(roleId: string, staffRows: readonly AdminStaff[]): number {
  return staffRows.filter((row) => (liveAssignments[row.id] ?? row.roleId) === roleId).length;
}

export function getMockStaffRoleAssignment(staffId: string): string | undefined {
  return liveAssignments[staffId];
}

export function setMockStaffRoleAssignment(staffId: string, roleId: string): void {
  liveAssignments[staffId] = roleId;
}

export function saveLiveMockStaffRole(record: MockStaffRoleRecord): MockStaffRoleRecord {
  const index = liveRoles.findIndex((item) => item.id === record.id);
  if (index >= 0) liveRoles[index] = structuredClone(record);
  else liveRoles = [structuredClone(record), ...liveRoles];
  return structuredClone(record);
}

export function decorateAdminStaff(staff: AdminStaff): AdminStaff {
  const roleId = liveAssignments[staff.id] ?? staff.roleId;
  const role = roleId ? liveRoles.find((item) => item.id === roleId) : undefined;
  return {
    ...staff,
    roleId: role?.id ?? roleId,
    roleKey: role?.key ?? staff.roleKey,
    roleName: role?.name ?? staff.roleName,
  };
}

export function mockStaffMemberById(staffId: string): AdminStaff | undefined {
  const staff = mockStaffMembers.find((row) => row.id === staffId);
  return staff ? decorateAdminStaff(staff) : undefined;
}

export function isMockStaffIdentityId(value: unknown): value is MockStaffIdentityId {
  return typeof value === "string" && mockStaffMembers.some((row) => row.id === value);
}

export function resolveMockStaffActorFromStaffId(
  staffId: string | null | undefined,
): StaffAuthorizationActor | null {
  if (!staffId) return null;
  const staff = mockStaffMemberById(staffId);
  const roleId = liveAssignments[staffId] ?? staff?.roleId;
  const role = roleId ? liveRoles.find((item) => item.id === roleId) : undefined;
  if (!staff || !role) return null;
  const permissions = filterPermissionKeys(resolveRolePermissions(role));
  return {
    userId: `user-${staff.id}`,
    staffId: staff.id,
    staffStatus: staff.status,
    roleId: role.id,
    roleKey: role.key,
    roleName: role.name,
    roleActive: role.status === "active",
    permissions,
    coachId: staff.coachId,
    isCoach: staff.isCoach,
    email: staff.email,
    isSystem: false,
  };
}

export function mockStaffAuthorizationFingerprint(staffId: string): string {
  const actor = resolveMockStaffActorFromStaffId(staffId);
  if (!actor) return `staff:${staffId}:unresolved`;
  const role = liveRoles.find((item) => item.id === actor.roleId);
  return `${actorAuthorizationFingerprint(actor)}:r${role?.revision ?? 0}`;
}
