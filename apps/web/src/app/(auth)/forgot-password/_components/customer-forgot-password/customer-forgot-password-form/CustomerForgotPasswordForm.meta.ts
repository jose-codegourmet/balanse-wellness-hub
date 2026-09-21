/** Customer password-reset form contract. */
export const customerForgotPasswordFormMeta = {
  purpose: "Collect an email address for the mock password-reset request.",
  whenToUse: "Use inside the customer forgot-password screen.",
  whenNotToUse: "Do not use as a real email delivery workflow.",
} as const;
