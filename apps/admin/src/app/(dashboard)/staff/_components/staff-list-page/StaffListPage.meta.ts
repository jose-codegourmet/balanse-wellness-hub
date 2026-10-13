export const staffListPageMeta = {
  purpose:
    "List staff with private profile photos or initials, roles and coach links, with permission-gated add/edit and copy-link actions. Staff portraits are independent of public coach portraits.",
  whenToUse: "The staff management index.",
  whenNotToUse: "Role editing or customer account management.",
  invitations:
    "Separate Invite and Reset password cells expose Copy link buttons for active rows, including mobile cards; no overflow menu. Reset links support confirmed accounts without sending email. Both actions require staff.manage and server-side target-role checks. Clipboard failures open the copy dialog; tokens never enter list query data.",
} as const;
