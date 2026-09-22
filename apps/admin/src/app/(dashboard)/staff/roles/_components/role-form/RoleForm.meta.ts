export const roleFormMeta = {
  purpose:
    "Create or edit a custom staff authorization role from the canonical permission registry.",
  whenToUse: "Use on /staff/roles/new and /staff/roles/[roleId] for custom roles.",
  whenNotToUse:
    "Do not use for staff assignment, nav gating, or inventing permission keys outside PERMISSION_REGISTRY.",
} as const;
