import type { AdminStaff, StaffAuthorizationActor, StaffRoleDefinition } from "@balanse/domain";
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
} as const;

/** Custom-role allow-list composed from the seeded Front Desk matrix — not a copied registry. */
export const COMMUNITY_HOST_PERMISSION_KEYS = FRONT_DESK_PERMISSION_KEYS.filter(
  (key) =>
    key === "dashboard.operations.read" ||
    key === "customers.read" ||
    key === "classes.read" ||
    key === "coaches.read",
);

export type MockStaffRoleRecord = StaffRoleDefinition & {
  id: string;
  /** Bumps authorization fingerprints when a role matrix is edited in the harness. */
  revision: number;
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
];

export const MOCK_STAFF_IDS = {
  rex: "staff-rex",
  partner: "staff-partner",
  coach: "staff-ephraim",
  disabled: "staff-disabled",
  custom: "staff-custom",
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
];

export const mockStaffMembers: AdminStaff[] = [
  {
    id: MOCK_STAFF_IDS.rex,
    name: "Rex Francis Regis",
    email: "rex@balanse.example",
    role: "ADMIN",
    status: "active",
    isCoach: true,
    coachId: "coach-rex",
  },
  {
    id: MOCK_STAFF_IDS.partner,
    name: "Studio Partner",
    email: "partner@balanse.example",
    role: "ADMIN",
    status: "active",
    isCoach: false,
    coachId: null,
  },
  {
    id: MOCK_STAFF_IDS.coach,
    name: "Ephraim Bacaltos",
    email: "ephraim@balanse.example",
    role: "ADMIN",
    status: "active",
    isCoach: true,
    coachId: "coach-ephraim",
  },
  {
    id: MOCK_STAFF_IDS.disabled,
    name: "Inactive Coordinator",
    email: "disabled@balanse.example",
    role: "ADMIN",
    status: "disabled",
    isCoach: false,
    coachId: null,
  },
  {
    id: MOCK_STAFF_IDS.custom,
    name: "Mia Reyes",
    email: "mia@balanse.example",
    role: "ADMIN",
    status: "active",
    isCoach: false,
    coachId: null,
  },
];

const staffRoleIdByStaffId: Record<string, string> = Object.fromEntries(
  MOCK_STAFF_IDENTITIES.map((row) => [row.staffId, row.roleId]),
);

export function mockStaffRoleById(roleId: string): MockStaffRoleRecord | undefined {
  return mockStaffRoles.find((role) => role.id === roleId);
}

export function mockStaffMemberById(staffId: string): AdminStaff | undefined {
  return mockStaffMembers.find((row) => row.id === staffId);
}

export function isMockStaffIdentityId(value: unknown): value is MockStaffIdentityId {
  return typeof value === "string" && mockStaffMembers.some((row) => row.id === value);
}

export function resolveMockStaffActorFromStaffId(
  staffId: string | null | undefined,
): StaffAuthorizationActor | null {
  if (!staffId) return null;
  const staff = mockStaffMemberById(staffId);
  const roleId = staffRoleIdByStaffId[staffId];
  const role = roleId ? mockStaffRoleById(roleId) : undefined;
  if (!staff || !role) return null;
  const permissions = filterPermissionKeys(resolveRolePermissions(role));
  return {
    userId: `user-${staff.id}`,
    staffId: staff.id,
    staffStatus: staff.status,
    roleId: role.id,
    roleKey: role.key,
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
  const role = mockStaffRoleById(actor.roleId);
  return `${actorAuthorizationFingerprint(actor)}:r${role?.revision ?? 0}`;
}
