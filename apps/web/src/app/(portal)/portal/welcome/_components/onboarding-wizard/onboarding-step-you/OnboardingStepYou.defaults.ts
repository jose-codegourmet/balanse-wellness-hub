import type { CustomerProfile } from "@balanse/domain";
import type { OnboardingStepYouValues } from "./OnboardingStepYou.schema";

export const onboardingStepYouDefaultValues: OnboardingStepYouValues = {
  firstName: "",
  lastName: "",
  nickname: "",
};

export function onboardingStepYouValuesFrom(profile: CustomerProfile): OnboardingStepYouValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickname: profile.nickname ?? "",
  };
}
