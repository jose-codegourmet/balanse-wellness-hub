import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { PortalHome } from "@/modules/customer/PortalHome";
import { getServerMockPrincipal } from "@/modules/session/server-principal";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Customer portal home and booking list.",
};

export default async function Page() {
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const [profile, bookings] = await Promise.all([
    adapter.getMe(principal.customerId),
    adapter.getBookings(principal.customerId),
  ]);

  if (!profile) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-3xl">My bookings</h1>
        <p className="mt-3 text-sm text-muted-foreground">No mock profile is selected.</p>
      </section>
    );
  }

  return <PortalHome profile={profile} bookings={bookings} />;
}
