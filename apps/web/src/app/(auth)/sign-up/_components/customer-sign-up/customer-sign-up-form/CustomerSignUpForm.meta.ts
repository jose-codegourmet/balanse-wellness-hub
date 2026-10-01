/**
 * # CustomerSignUpForm (#351)
 *
 * React Hook Form + `zodResolver` sign-up form: **First name** + **Last name**
 * (side by side from `sm`, both required, 1–50 chars, trimmed), email, PH
 * contact number (`PhPhoneInput`), password and confirm. No other fields
 * (OQ-3).
 *
 * - `defaultValues` comes from `CustomerSignUpForm.defaults.ts`. Finishing a
 *   Google sign-up passes `customerSignUpGoogleDefaults(...)`
 *   (`authMethod: "google"`): names and email are prefilled, the email is
 *   read-only and the password fields are hidden. Change the `key` to apply a
 *   new prefill.
 * - `customerSignUpIdentitySchema` is the subset the sign-up server action
 *   re-validates before calling Supabase Auth.
 * - `canSubmit` lets the parent block submit (policy acceptance lives outside
 *   the form) while still revealing field errors.
 *
 * ## When not to use
 *
 * Admin or coach accounts. Profile edits (`BasicProfileForm`).
 */
export const customerSignUpFormMeta = {
  purpose: "Collect first/last name, email, contact number and password for a new member account.",
  whenToUse: "Inside the customer sign-up screen only.",
  whenNotToUse: "Admin or coach accounts, or editing an existing profile.",
} as const;
