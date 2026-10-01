import {
  firstIncompleteOnboardingStep,
  type OnboardingStepId,
  onboardingCompletion,
  safeReturnTo,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
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
  const returnTo = safeReturnTo(rawReturnTo, "/portal");
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const profile = await adapter.getMe(principal.customerId);

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-3xl">Welcome</h1>
        <p className="mt-3 text-sm text-muted-foreground">No mock profile is selected.</p>
      </section>
    );
  }

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
