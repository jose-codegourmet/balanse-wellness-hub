import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  OnboardingStepId,
  PublicClass,
  ReferralChannel,
} from "@balanse/domain";
import type { ReactNode, Ref } from "react";
import type { CustomerOnboardingActions } from "../../../profile/_lib/customer-self-service.types";

/**
 * # OnboardingWizard (#352)
 *
 * `/portal/welcome?returnTo=<safe path>`: a short, skippable wizard after
 * sign-up. Steps (`ONBOARDING_STEPS`): **You** → **Goals & experience** →
 * **Interests** → **How did you hear about us?** → **Done**. "Step n of 4"
 * excludes Done.
 *
 * - Starts at `initialStep` (the route passes `firstIncompleteOnboardingStep`).
 * - **Continue** saves the step (`patchProfile` for You, `saveAnswers` for the
 *   rest), so progress persists. **Back** keeps unsaved edits: every step
 *   form stays mounted (inactive ones are `hidden`).
 * - **Skip for now** (header, every step) → `skip()` → `returnTo`. Saved
 *   answers are kept.
 * - **Finish** (last input step) → `complete()` → Done: "You're all set,
 *   <display name>!", primary "Back to <returnLabel>" for a public
 *   `/sessions/…` or `/events/…` `returnTo`, otherwise "Browse the schedule"
 *   (`/book/calendar`); secondary "Go to my portal".
 * - Focus moves to the step heading on every step change.
 * - No DOB, health, injury or emergency-contact questions (OQ-3).
 *
 * Step forms are reused, not copied, by the profile "About you" section.
 */
export type OnboardingWizardProps = {
  profile: CustomerProfile;
  answers: CustomerOnboardingAnswers | null;
  /** Active classes (`getPublicClasses()`). */
  classes: PublicClass[];
  referralChannel: ReferralChannel | null;
  initialStep: OnboardingStepId;
  /** Already validated with `safeReturnTo`. */
  returnTo: string;
  /** Name of the public session/event `returnTo` points at, when resolvable. */
  returnLabel: string | null;
  actions: CustomerOnboardingActions;
};

/** Shared contract for the four step forms. */
export type OnboardingStepFormProps<Values> = {
  defaultValues?: Values;
  onSubmit: (values: Values) => void | Promise<void>;
  /** Buttons rendered inside the form: wizard Back / Continue, or a profile Save. */
  footer: ReactNode;
  /** Wizard uses 2; the profile "About you" panels use 3. */
  headingLevel?: 2 | 3;
  headingRef?: Ref<HTMLHeadingElement>;
  /** Save failure shown above the footer. */
  formError?: string | null;
  /** Prefix for element ids so two instances never collide. */
  idPrefix?: string;
};

export const onboardingWizardMeta = {
  purpose: "Skippable post-sign-up wizard for name/photo, goals, interests and heard-from.",
  whenToUse: "The /portal/welcome route only.",
  whenNotToUse: "Editing answers later (profile About you reuses the step forms instead).",
} as const;
