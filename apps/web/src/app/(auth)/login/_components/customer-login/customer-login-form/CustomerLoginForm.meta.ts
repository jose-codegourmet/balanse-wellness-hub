/** Customer login form contract. */
export const customerLoginFormMeta = {
  purpose:
    "Collect member email/password credentials (Supabase Auth) and show validation from the login screen.",
  whenToUse: "Use inside the public customer login screen.",
  whenNotToUse: "Do not use for admin authentication.",
} as const;
