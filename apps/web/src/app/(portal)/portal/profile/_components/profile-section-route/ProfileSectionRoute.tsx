import {
  getMe,
  getMyOnboarding,
  listMyPolicyAcceptances,
  listPublicClasses,
} from "@balanse/api-client";
import type { CustomerProfileSectionId } from "@balanse/domain";
import { redirect } from "next/navigation";
import { myPolicyAcceptancesQuery, myProfileQuery } from "@/lib/query/customers";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchWeb } from "@/lib/query/prefetch";
import { getCustomerAccessToken, getSessionUser } from "@/modules/session/current-customer";
import { customerProfileServerActions } from "../../_lib/customer-self-service-routes";
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
  const session = await getSessionUser();
  if (!session) redirect("/login?returnTo=/portal/profile");
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [profile, acceptancePayload] = await Promise.all([
    getMe(fetcher),
    listMyPolicyAcceptances(fetcher),
  ]);
  const acceptances = acceptancePayload.items;

  const about =
    section === "about"
      ? await Promise.all([getMyOnboarding(fetcher), listPublicClasses(fetcher)]).then(
          ([payload, classes]) => ({
            answers: payload.onboarding,
            classes: classes.items.filter((gymClass) => gymClass.active),
            referralChannel: profile.referralChannel,
          }),
        )
      : undefined;

  return prefetchWeb(
    [myProfileQuery(profile.id, fetcher), myPolicyAcceptancesQuery(profile.id, fetcher)],
    <ProfilePage
      initialProfile={profile}
      initialAcceptances={acceptances}
      section={section}
      about={about}
      actions={customerProfileServerActions}
    />,
  );
}
