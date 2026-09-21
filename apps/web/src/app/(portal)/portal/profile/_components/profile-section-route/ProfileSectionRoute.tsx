import type { CustomerProfileSectionId } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
import { ProfilePage } from "../profile-page/ProfilePage";

export type ProfileSectionRouteProps = {
  section: CustomerProfileSectionId;
};

/**
 * Shared loader for the `/portal/profile/*` submenu routes (FE-CUS-017). Each
 * section is a real route so deep links and the back button both work; they
 * only differ by which section the shared shell renders.
 */
export async function ProfileSectionRoute({ section }: ProfileSectionRouteProps) {
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const [profile, acceptances] = await Promise.all([
    adapter.getMe(principal.customerId),
    adapter.getMePolicyAcceptances(principal.customerId),
  ]);

  if (!profile) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="mt-3 text-sm text-muted-foreground">No mock profile is selected.</p>
      </section>
    );
  }

  return (
    <ProfilePage initialProfile={profile} initialAcceptances={acceptances} section={section} />
  );
}
