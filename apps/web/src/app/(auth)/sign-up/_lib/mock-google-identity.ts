/**
 * The identity the mock "Continue with Google" button returns during sign-up.
 * Mirrors the OIDC claims a real Google sign-in provides (`given_name`,
 * `family_name`, `email`). `family_name` can be missing for some accounts,
 * in which case the customer types their last name.
 */
export type MockGoogleIdentity = {
  given_name: string;
  family_name?: string | null;
  email: string;
};

export const MOCK_GOOGLE_SIGN_UP_IDENTITY: MockGoogleIdentity = {
  given_name: "Gia",
  family_name: "Ramos",
  email: "gia.ramos@example.com",
};
