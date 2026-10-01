import type { PublicClass } from "@balanse/domain";
import type { OnboardingStepFormProps } from "../OnboardingWizard.meta";
import type { OnboardingStepInterestsValues } from "./OnboardingStepInterests.schema";

/**
 * # OnboardingStepInterests (#352, step 3)
 *
 * Multi-select cards for **active classes** (`getPublicClasses()`: name +
 * hero thumbnail), optional. "Something else" reveals a text input
 * (≤ `ONBOARDING_OTHER_MAX`) for things the studio doesn't offer yet; hiding
 * it clears the text on save. Saves `interestClassIds` and `interestsOther`.
 * Reused by the profile "About you" section.
 */
export type OnboardingStepInterestsProps =
  OnboardingStepFormProps<OnboardingStepInterestsValues> & {
    classes: Pick<PublicClass, "id" | "name" | "heroImage" | "shortDescription">[];
  };

export const onboardingStepInterestsMeta = {
  purpose: "Let a customer flag classes they're curious about.",
  whenToUse: "OnboardingWizard step 3 and profile About you.",
  whenNotToUse: "Booking or filtering the schedule.",
} as const;
