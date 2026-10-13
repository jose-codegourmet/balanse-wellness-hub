export const roleFormMeta = {
  purpose:
    "Create or edit a custom staff authorization role from the API permission-registry query.",
  whenToUse: "Use on /staff/roles/new and /staff/roles/[roleId] for custom roles.",
  whenNotToUse:
    "Do not use for staff assignment, nav gating, or inventing permission keys outside the server registry.",
} as const;
