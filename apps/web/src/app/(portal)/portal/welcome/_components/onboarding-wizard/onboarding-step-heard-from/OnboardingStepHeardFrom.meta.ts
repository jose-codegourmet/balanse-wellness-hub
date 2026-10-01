import type { OnboardingStepFormProps } from "../OnboardingWizard.meta";
import type { OnboardingStepHeardFromValues } from "./OnboardingStepHeardFrom.schema";

/**
 * # OnboardingStepHeardFrom (#352, step 4)
 *
 * "How did you hear about us?" — single choice from `HEARD_FROM_OPTIONS`
 * (radio chips); "Other" reveals text (≤ `ONBOARDING_OTHER_MAX`).
 *
 * Prefill (`onboardingStepHeardFromValuesFrom`): the saved answer, else
 * `heardFromForReferralChannel(getMyReferralChannel())`. When a customer's
 * link or QR brought them in (`referredByFriend`) it shows "Looks like a
 * friend shared a class with you 👋". The referrer is **never** named.
 * Reused by the profile "About you" section.
 */
export type OnboardingStepHeardFromProps =
  OnboardingStepFormProps<OnboardingStepHeardFromValues> & {
    referredByFriend?: boolean;
  };

export const onboardingStepHeardFromMeta = {
  purpose: "Ask how the customer found the studio, prefilled from share attribution.",
  whenToUse: "OnboardingWizard step 4 and profile About you.",
  whenNotToUse: "Showing who referred someone (never shown to customers).",
} as const;
