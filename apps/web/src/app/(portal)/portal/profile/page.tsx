import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { ProfilePage } from "@/modules/customer/ProfilePage";
import { getServerMockPrincipal } from "@/modules/session/server-principal";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Balansé profile.",
};

export default async function Page() {
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

  return <ProfilePage initialProfile={profile} initialAcceptances={acceptances} />;
}
