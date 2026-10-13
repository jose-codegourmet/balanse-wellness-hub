export const rolePermissionChecklistMeta = {
  purpose:
    "Grouped permission checklist generated from the admin permission-registry query, with select/clear group.",
  whenToUse: "Use inside RoleForm with permissions returned by adminPermissionsQuery.",
  whenNotToUse: "Do not use as a standalone form or invent permission strings.",
} as const;
