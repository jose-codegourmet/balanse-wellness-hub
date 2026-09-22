export const roleFormPageMeta = {
  purpose: "Load a role and host RoleForm for create, edit, or clone.",
  whenToUse: "Use on /staff/roles/new and /staff/roles/[roleId].",
  whenNotToUse: "Do not fetch /api or Supabase from this screen.",
} as const;
