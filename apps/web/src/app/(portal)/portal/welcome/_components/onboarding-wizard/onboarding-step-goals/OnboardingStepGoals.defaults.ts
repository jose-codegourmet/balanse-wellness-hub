import type { CustomerOnboardingAnswers } from "@balanse/domain";
import type { OnboardingStepGoalsValues } from "./OnboardingStepGoals.schema";

export const onboardingStepGoalsDefaultValues: OnboardingStepGoalsValues = {
  goals: [],
  goalsOther: "",
  experienceLevel: null,
};

export function onboardingStepGoalsValuesFrom(
  answers: CustomerOnboardingAnswers | null,
): OnboardingStepGoalsValues {
  if (!answers) return onboardingStepGoalsDefaultValues;
  return {
    goals: [...answers.goals],
    goalsOther: answers.goalsOther,
    experienceLevel: answers.experienceLevel,
  };
}
