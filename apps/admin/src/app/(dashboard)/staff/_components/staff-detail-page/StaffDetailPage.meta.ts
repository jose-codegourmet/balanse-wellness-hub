export const staffDetailPageMeta = {
  purpose:
    "Create or edit staff access, private profile photos, and an optional linked coach profile.",
  whenToUse: "Staff add/detail routes.",
  whenNotToUse: "Public registration or password recovery.",
  invitations:
    "Creation shows a copy-link dialog. Existing staff have a permission-gated Actions menu to the right of their name for Copy invite link and Copy password reset link. Neither sends email. Confirmed accounts use the reset action. Account edits never generate links automatically.",
  identity:
    "Header avatar and separate immediate-save photo card use the private profile avatar, not the public coach portrait. New staff must be saved before upload.",
  data: "Reads staff and active roles through React Query. Account edits, role assignment, coach linking, and disabling use API-backed mutations; changing a linked coach replaces the link in one API transaction.",
} as const;
