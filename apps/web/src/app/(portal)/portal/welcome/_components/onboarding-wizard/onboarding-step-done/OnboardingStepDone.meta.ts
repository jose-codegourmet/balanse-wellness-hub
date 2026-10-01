import type { Ref } from "react";

/**
 * # OnboardingStepDone (#352)
 *
 * "You're all set, <display name>!" after Finish.
 *
 * - Primary: **Back to <returnLabel>** when `returnTo` is a public session or
 *   event page (someone who arrived from a shared link lands back on it, now
 *   signed in, so the roster is visible). Otherwise **Browse the schedule**
 *   → `/book/calendar`.
 * - Secondary: **Go to my portal** → `/portal`.
 */
export type OnboardingStepDoneProps = {
  displayName: string;
  /** Already validated with `safeReturnTo`. */
  returnTo: string;
  /** Name of the shared session/event, when known. */
  returnLabel: string | null;
  headingRef?: Ref<HTMLHeadingElement>;
};

export const onboardingStepDoneMeta = {
  purpose: "Close onboarding and send the customer back where they came from.",
  whenToUse: "OnboardingWizard after Finish.",
  whenNotToUse: "Skip (that goes straight to returnTo).",
} as const;
