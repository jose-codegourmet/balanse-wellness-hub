import { EMAIL_FORMAT_RE, isPhMobile, PERSON_NAME_MAX, PH_MOBILE_ERROR } from "@balanse/domain";
import { z } from "zod";

export const PASSWORD_MIN = 8;

function personName(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(PERSON_NAME_MAX, `${label} must be ${PERSON_NAME_MAX} characters or fewer.`);
}

/**
 * Identity fields sent to `createCustomer`. The sign-up server action
 * re-validates with this schema, so it never trusts the browser.
 */
export const customerSignUpIdentitySchema = z.object({
  /** `google` when the mock Google identity prefilled the form; no password then. */
  authMethod: z.enum(["email", "google"]),
  firstName: personName("First name"),
  lastName: personName("Last name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(EMAIL_FORMAT_RE, "Enter a valid email."),
  contactNumber: z
    .string()
    .trim()
    .min(1, "Contact number is required.")
    .refine((value) => isPhMobile(value), PH_MOBILE_ERROR),
});

export type CustomerSignUpIdentity = z.infer<typeof customerSignUpIdentitySchema>;

export const customerSignUpFormSchema = customerSignUpIdentitySchema
  .extend({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    // Google holds the credential, so there is no password to set.
    if (values.authMethod === "google") return;
    if (!values.password) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "Password is required." });
    } else if (values.password.length < PASSWORD_MIN) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: `Use at least ${PASSWORD_MIN} characters.`,
      });
    }
    if (!values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Confirm your password.",
      });
    } else if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type CustomerSignUpFormValues = z.infer<typeof customerSignUpFormSchema>;
