/** Admin login form contract. */
export const adminLoginFormMeta = {
  purpose:
    "Collect staff email/password credentials (Supabase Auth) via the admin form kit and surface sign-in errors.",
  whenToUse: "Use inside the admin login screen.",
  whenNotToUse: "Do not reuse for customer authentication.",
} as const;
