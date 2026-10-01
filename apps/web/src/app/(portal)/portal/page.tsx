import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalHome } from "@/modules/customer/PortalHome";
import { getCurrentCustomer } from "@/modules/session/current-customer";

export const metadata: Metadata = {
  title: "Home",
  description: "Customer portal home.",
};

export default async function Page() {
  const profile = await getCurrentCustomer();
  if (!profile) redirect("/login?returnTo=/portal");
  const adapter = getMockAdapter();
  const [bookings, onboardingAnswers] = await Promise.all([
    adapter.getBookings(profile.id),
    adapter.getMyOnboarding(profile.id).catch(() => null),
  ]);

  return <PortalHome profile={profile} bookings={bookings} onboardingAnswers={onboardingAnswers} />;
}
