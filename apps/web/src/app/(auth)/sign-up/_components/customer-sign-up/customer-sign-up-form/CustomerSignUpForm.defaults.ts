import type { CustomerSignUpFormValues } from "./CustomerSignUpForm.schema";

export const customerSignUpFormDefaultValues: CustomerSignUpFormValues = {
  authMethod: "email",
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
  password: "",
  confirmPassword: "",
};

/** Mock Google identity prefill (`given_name` / `family_name` / `email`). */
export function customerSignUpGoogleDefaults(identity: {
  givenName: string;
  familyName?: string | null;
  email: string;
}): CustomerSignUpFormValues {
  return {
    ...customerSignUpFormDefaultValues,
    authMethod: "google",
    firstName: identity.givenName,
    lastName: identity.familyName ?? "",
    email: identity.email,
  };
}
