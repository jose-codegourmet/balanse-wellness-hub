import type { ReactNode } from "react";
import type { OnboardingStepFormProps } from "../OnboardingWizard.meta";
import type { OnboardingStepYouValues } from "./OnboardingStepYou.schema";

/**
 * # OnboardingStepYou (#352, step 1)
 *
 * Photo (optional, `avatarSlot` — the wizard passes an `AvatarUploader` that
 * saves on its own), First name + Last name (prefilled, required — this is
 * where legacy empty last names get fixed), Nickname (optional) with the
 * "Other members will see you as …" preview (`ProfileNameFields`).
 * Values save through `patchProfile`.
 */
export type OnboardingStepYouProps = OnboardingStepFormProps<OnboardingStepYouValues> & {
  avatarSlot?: ReactNode;
  /** Current photo for the display-name preview. */
  avatarUrl: string | null;
  seed?: string;
};

export const onboardingStepYouMeta = {
  purpose: "Confirm names, nickname and photo during onboarding.",
  whenToUse: "OnboardingWizard step 1.",
  whenNotToUse: "The profile page (BasicProfileForm owns names there).",
} as const;
