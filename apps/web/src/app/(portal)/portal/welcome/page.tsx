import {
  firstIncompleteOnboardingStep,
  type OnboardingStepId,
  onboardingCompletion,
  safeReturnTo,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { customerOnboardingServerActions } from "../profile/_lib/customer-self-service-routes";
import { OnboardingWizard } from "./_components/onboarding-wizard/OnboardingWizard";
import { publicReturnLabel } from "./_lib/public-return-label";

export const metadata: Metadata = {
  title: "Welcome",
  description: "A few quick questions so your coaches can get to know you.",
  robots: { index: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo: rawReturnTo } = await searchParams;
  const safe = safeReturnTo(rawReturnTo, "/portal");
  // Never bounce back into the wizard itself (redirect loop once completed).
  const returnTo = safe.startsWith("/portal/welcome") ? "/portal" : safe;
  const profile = await getCurrentCustomer();
  if (!profile) redirect(`/login?returnTo=${encodeURIComponent("/portal/welcome")}`);
  const adapter = getMockAdapter();

  // Finished onboarding never shows again; go where the customer was heading.
  if (profile.onboardingStatus === "completed") redirect(returnTo);

  const [answers, classes, referralChannel, returnLabel] = await Promise.all([
    adapter.getMyOnboarding(profile.id),
    adapter.getPublicClasses(),
    adapter.getMyReferralChannel(profile.id),
    publicReturnLabel(returnTo),
  ]);

  // Resume at the first incomplete step. Everything answered but not finished
  // yet (skipped late) lands on the last step so Finish is one tap away.
  const resume = firstIncompleteOnboardingStep(onboardingCompletion(answers, profile));
  const initialStep: OnboardingStepId = resume === "done" ? "heard-from" : resume;

  return (
    <OnboardingWizard
      profile={profile}
      answers={answers}
      classes={classes.filter((gymClass) => gymClass.active)}
      referralChannel={referralChannel}
      initialStep={initialStep}
      returnTo={returnTo}
      returnLabel={returnLabel}
      actions={customerOnboardingServerActions}
    />
  );
}
