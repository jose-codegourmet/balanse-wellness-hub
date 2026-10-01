import type { OnboardingCompletion, OnboardingStatus } from "@balanse/domain";

/**
 * # CompleteProfileCard (#352)
 *
 * Portal-home nudge for anyone whose `onboardingStatus !== "completed"`
 * (not started, in progress, skipped — including existing members who never
 * saw the wizard).
 *
 * - Progress from `onboardingCompletion(answers, profile)`: "2 of 4 done"
 *   plus a thin bar.
 * - The missing items (`completion.missing[].label`, e.g. "Add a photo or
 *   nickname", "Tell us your goals").
 * - **Continue** → `/portal/welcome?returnTo=/portal` (resumes at the first
 *   incomplete step).
 * - Not dismissible; it disappears once onboarding is completed. Compact on
 *   purpose: it sits below the next-booking card and must never push that
 *   card below the fold on mobile.
 */
export type CompleteProfileCardProps = {
  completion: OnboardingCompletion;
  status: Exclude<OnboardingStatus, "completed">;
  href?: string;
  className?: string;
};

export const completeProfileCardMeta = {
  purpose: "Nudge customers to finish onboarding from portal home.",
  whenToUse: "PortalHome, only while onboarding is not completed.",
  whenNotToUse: "Completed customers, public pages, admin.",
} as const;
