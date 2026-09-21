/** Customer login form contract. */
export const customerLoginFormMeta = {
  purpose: "Collect mock member email credentials and report validation to the login screen.",
  whenToUse: "Use inside the public customer login screen.",
  whenNotToUse: "Do not use for admin authentication.",
} as const;
