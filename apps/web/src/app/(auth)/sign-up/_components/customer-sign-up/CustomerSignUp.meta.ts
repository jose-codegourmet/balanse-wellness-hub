/**
 * # CustomerSignUp (FE-CUS, #351)
 *
 * The `/sign-up` screen: mock "Continue with Google" (prefills first/last
 * name and email from `given_name` / `family_name`), `CustomerSignUpForm`,
 * admin-attached policy acceptance, and a link to log in that keeps
 * `returnTo`.
 *
 * - `createAccount` is the `createCustomerAccount` server action: it reads
 *   the HttpOnly share-attribution cookie, calls `createCustomer({ firstName,
 *   lastName, email, contactNumber, authMethod, attribution })`, records the
 *   policy acceptances and clears the cookie.
 * - Success sets the mock principal and goes to
 *   `/portal/welcome?returnTo=<safeReturnTo(returnTo)>` (onboarding, #352).
 *   Only same-origin relative paths survive `safeReturnTo`; anything else
 *   falls back to `/portal`.
 */
export const customerSignUpMeta = {
  purpose: "Create a member account (email or mock Google) and start onboarding.",
  whenToUse: "The public `/sign-up` route only.",
  whenNotToUse: "Logging in an existing member (CustomerLogin) or staff accounts.",
} as const;
