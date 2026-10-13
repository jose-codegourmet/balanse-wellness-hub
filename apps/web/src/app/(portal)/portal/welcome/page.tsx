import { getMe, getMyOnboarding, listPublicClasses } from "@balanse/api-client";
import {
  firstIncompleteOnboardingStep,
  type OnboardingStepId,
  onboardingCompletion,
  safeReturnTo,
} from "@balanse/domain";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
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

  // Finished onboarding never shows again; go where the customer was heading.
  if (profile.onboardingStatus === "completed") redirect(returnTo);

  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [onboardingPayload, classPayload, customer, returnLabel] = await Promise.all([
    getMyOnboarding(fetcher),
    listPublicClasses(fetcher),
    getMe(fetcher),
    publicReturnLabel(returnTo),
  ]);
  const answers = onboardingPayload.onboarding;

  // Resume at the first incomplete step. Everything answered but not finished
  // yet (skipped late) lands on the last step so Finish is one tap away.
  const resume = firstIncompleteOnboardingStep(onboardingCompletion(answers, profile));
  const initialStep: OnboardingStepId = resume === "done" ? "heard-from" : resume;

  return (
    <OnboardingWizard
      profile={profile}
      answers={answers}
      classes={classPayload.items.filter((gymClass) => gymClass.active)}
      referralChannel={customer.referralChannel}
      initialStep={initialStep}
      returnTo={returnTo}
      returnLabel={returnLabel}
    />
  );
}
