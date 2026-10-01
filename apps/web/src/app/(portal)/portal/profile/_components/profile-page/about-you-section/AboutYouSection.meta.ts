import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  PublicClass,
  ReferralChannel,
} from "@balanse/domain";
import type { CustomerOnboardingActions } from "../../../_lib/customer-self-service.types";

/**
 * # AboutYouSection (#352)
 *
 * `/portal/profile/about`. Reuses the onboarding step forms (not copies):
 * `OnboardingStepGoals`, `OnboardingStepInterests`, `OnboardingStepHeardFrom`,
 * each in its own panel with its own **Save** (`saveMyOnboarding`, partial).
 *
 * - Copy: "Visible to you, your coaches and studio staff. Never shown to
 *   other members."
 * - "Last updated <date>" from `answers.updatedAt`.
 * - When onboarding is not completed, links to the full wizard
 *   (`/portal/welcome?returnTo=/portal/profile/about`).
 * - No DOB, health or emergency-contact fields (OQ-3).
 */
export type AboutYouSectionProps = {
  profile: CustomerProfile;
  answers: CustomerOnboardingAnswers | null;
  classes: PublicClass[];
  referralChannel: ReferralChannel | null;
  actions: Pick<CustomerOnboardingActions, "saveAnswers">;
};

export const aboutYouSectionMeta = {
  purpose: "Let customers review and edit their onboarding answers.",
  whenToUse: "ProfilePage when the active section is `about`.",
  whenNotToUse: "Admin or coach views of answers (#353).",
} as const;
