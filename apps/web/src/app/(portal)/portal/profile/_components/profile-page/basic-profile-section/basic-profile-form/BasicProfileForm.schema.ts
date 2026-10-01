import {
  EMAIL_FORMAT_RE,
  isPhMobile,
  NICKNAME_MAX,
  NICKNAME_MIN,
  PERSON_NAME_MAX,
  PH_MOBILE_ERROR,
} from "@balanse/domain";
import { z } from "zod";

function personName(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(PERSON_NAME_MAX, `${label} must be ${PERSON_NAME_MAX} characters or fewer.`);
}

/** Shared with the onboarding "You" step (`basicProfileIdentitySchema`). */
export const basicProfileIdentitySchema = z.object({
  firstName: personName("First name"),
  lastName: personName("Last name"),
  nickname: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (value.length >= NICKNAME_MIN && value.length <= NICKNAME_MAX),
      `Nickname must be ${NICKNAME_MIN}–${NICKNAME_MAX} characters.`,
    ),
});

export type BasicProfileIdentityValues = z.infer<typeof basicProfileIdentitySchema>;

export const basicProfileFormSchema = basicProfileIdentitySchema.extend({
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

export type BasicProfileFormValues = z.infer<typeof basicProfileFormSchema>;
