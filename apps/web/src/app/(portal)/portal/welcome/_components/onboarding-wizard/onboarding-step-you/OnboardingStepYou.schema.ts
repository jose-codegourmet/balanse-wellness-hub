import {
  type BasicProfileIdentityValues,
  basicProfileIdentitySchema,
} from "../../../../profile/_components/profile-page/basic-profile-section/basic-profile-form/BasicProfileForm.schema";

/** Same rules as the profile: first + last name required, nickname optional (2–30). */
export const onboardingStepYouSchema = basicProfileIdentitySchema;

export type OnboardingStepYouValues = BasicProfileIdentityValues;
