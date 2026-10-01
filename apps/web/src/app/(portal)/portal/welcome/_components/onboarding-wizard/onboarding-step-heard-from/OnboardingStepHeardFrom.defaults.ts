import {
  type CustomerOnboardingAnswers,
  heardFromForReferralChannel,
  type ReferralChannel,
} from "@balanse/domain";
import type { OnboardingStepHeardFromValues } from "./OnboardingStepHeardFrom.schema";

export const onboardingStepHeardFromDefaultValues: OnboardingStepHeardFromValues = {
  heardFrom: null,
  heardFromOther: "",
};

/**
 * Saved answer first; otherwise prefill from share attribution
 * (friend's link/QR → Friend, studio QR → Event, studio link → none).
 */
export function onboardingStepHeardFromValuesFrom(
  answers: CustomerOnboardingAnswers | null,
  referralChannel: ReferralChannel | null,
): OnboardingStepHeardFromValues {
  if (answers?.heardFrom) {
    return { heardFrom: answers.heardFrom, heardFromOther: answers.heardFromOther };
  }
  return {
    ...onboardingStepHeardFromDefaultValues,
    heardFrom: heardFromForReferralChannel(referralChannel),
  };
}

/** True when a customer's shared link brought them in. Never reveals who. */
export function referredByCustomer(referralChannel: ReferralChannel | null): boolean {
  return referralChannel === "CUSTOMER_LINK" || referralChannel === "CUSTOMER_QR";
}
