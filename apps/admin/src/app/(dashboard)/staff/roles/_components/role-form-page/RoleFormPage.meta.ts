export const roleFormPageMeta = {
  purpose: "Load a role and host RoleForm for create, edit, or clone.",
  whenToUse: "Use on /staff/roles/new and /staff/roles/[roleId].",
  data: "Reads roles and the permission registry through React Query hooks. Saves and archives through API-backed mutations; a clone with edited permissions creates the selected matrix.",
  whenNotToUse: "Do not call Supabase directly or use mock adapter data at runtime.",
} as const;
