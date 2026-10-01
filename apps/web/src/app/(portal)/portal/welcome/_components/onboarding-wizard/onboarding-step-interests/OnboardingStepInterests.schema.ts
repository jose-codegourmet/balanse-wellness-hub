import { ONBOARDING_OTHER_MAX } from "@balanse/domain";
import { z } from "zod";

/** Optional step: zero classes is fine. */
export const onboardingStepInterestsSchema = z.object({
  interestClassIds: z.array(z.string()),
  interestsOther: z
    .string()
    .trim()
    .max(ONBOARDING_OTHER_MAX, `Keep it under ${ONBOARDING_OTHER_MAX} characters.`),
});

export type OnboardingStepInterestsValues = z.infer<typeof onboardingStepInterestsSchema>;
