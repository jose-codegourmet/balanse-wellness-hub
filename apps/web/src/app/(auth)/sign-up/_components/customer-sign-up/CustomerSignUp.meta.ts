/**
 * # CustomerSignUp (FE-CUS, #351)
 *
 * The `/sign-up` screen: "Continue with Google" (Supabase OAuth via
 * `/auth/google`), `CustomerSignUpForm`, admin-attached policy acceptance,
 * and a link to log in that keeps `returnTo`.
 *
 * - Google: new accounts return from `/auth/callback` to this screen with
 *   `googleIdentity` (first/last name and email from `given_name` /
 *   `family_name`) so they check their name and add a contact number.
 *   "Use email instead" signs that Google session out.
 * - `createAccount` is the `createCustomerAccount` server action: email
 *   accounts go through `auth.signUp` (names, contact number and share
 *   attribution as user metadata for `handle_new_user`); Google accounts save
 *   the checked fields to their `profiles` row. It records the policy
 *   acceptances and clears the share-attribution cookie.
 * - Success goes to `/portal/welcome?returnTo=<safeReturnTo(returnTo)>`
 *   (onboarding, #352), or shows "Check your inbox" while Supabase waits for
 *   email confirmation. Only same-origin relative paths survive
 *   `safeReturnTo`; anything else falls back to `/portal`.
 */
export const customerSignUpMeta = {
  purpose: "Create a member account (Supabase email or Google) and start onboarding.",
  whenToUse: "The public `/sign-up` route only.",
  whenNotToUse: "Logging in an existing member (CustomerLogin) or staff accounts.",
} as const;
