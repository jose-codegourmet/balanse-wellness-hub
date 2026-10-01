import type { CustomerOnboardingAnswers } from "@balanse/domain";
import type { OnboardingStepInterestsValues } from "./OnboardingStepInterests.schema";

export const onboardingStepInterestsDefaultValues: OnboardingStepInterestsValues = {
  interestClassIds: [],
  interestsOther: "",
};

export function onboardingStepInterestsValuesFrom(
  answers: CustomerOnboardingAnswers | null,
  activeClassIds?: readonly string[],
): OnboardingStepInterestsValues {
  if (!answers) return onboardingStepInterestsDefaultValues;
  // Drop classes that are no longer active so they can't be re-saved invisibly.
  const ids = activeClassIds
    ? answers.interestClassIds.filter((id) => activeClassIds.includes(id))
    : answers.interestClassIds;
  return { interestClassIds: [...ids], interestsOther: answers.interestsOther };
}
