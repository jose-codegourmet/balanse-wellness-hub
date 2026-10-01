import type { CustomerProfileSectionId } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { customerOnboardingServerActions } from "../../_lib/customer-self-service-routes";
import { ProfilePage } from "../profile-page/ProfilePage";

export type ProfileSectionRouteProps = {
  section: CustomerProfileSectionId;
};

/**
 * Shared loader for the `/portal/profile/*` submenu routes (FE-CUS-017). Each
 * section is a real route so deep links and the back button both work; they
 * only differ by which section the shared shell renders. The "About you"
 * section (#352) additionally loads onboarding answers and active classes.
 */
export async function ProfileSectionRoute({ section }: ProfileSectionRouteProps) {
  const profile = await getCurrentCustomer();
  if (!profile) redirect("/login?returnTo=/portal/profile");
  const adapter = getMockAdapter();
  const acceptances = await adapter.getMePolicyAcceptances(profile.id);

  const about =
    section === "about"
      ? await Promise.all([
          adapter.getMyOnboarding(profile.id),
          adapter.getPublicClasses(),
          adapter.getMyReferralChannel(profile.id),
        ]).then(([answers, classes, referralChannel]) => ({
          answers,
          classes: classes.filter((gymClass) => gymClass.active),
          referralChannel,
        }))
      : undefined;

  return (
    <ProfilePage
      initialProfile={profile}
      initialAcceptances={acceptances}
      section={section}
      about={about}
      actions={customerOnboardingServerActions}
    />
  );
}
