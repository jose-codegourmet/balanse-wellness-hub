import type { OnboardingStepFormProps } from "../OnboardingWizard.meta";
import type { OnboardingStepGoalsValues } from "./OnboardingStepGoals.schema";

/**
 * # OnboardingStepGoals (#352, step 2)
 *
 * Goals: multi-select chips from `FITNESS_GOAL_OPTIONS` (native checkboxes
 * styled with `chipVariants`), at least one. "Other" reveals a text input
 * (≤ `ONBOARDING_OTHER_MAX`). Experience: single choice from
 * `EXPERIENCE_LEVEL_OPTIONS` as radio rows rendered with `OptionRow` (label +
 * description). Saves `goals`, `goalsOther`, `experienceLevel` through
 * `saveMyOnboarding`. Reused by the profile "About you" section.
 */
export type OnboardingStepGoalsProps = OnboardingStepFormProps<OnboardingStepGoalsValues>;

export const onboardingStepGoalsMeta = {
  purpose: "Collect fitness goals and experience level.",
  whenToUse: "OnboardingWizard step 2 and profile About you.",
  whenNotToUse: "Anything medical: no injury, health or DOB questions (OQ-3).",
} as const;
