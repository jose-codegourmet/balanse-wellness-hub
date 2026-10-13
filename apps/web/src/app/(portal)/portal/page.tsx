import { getMyOnboarding, listMyBookings } from "@balanse/api-client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { PortalHome } from "@/modules/customer/PortalHome";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";

export const metadata: Metadata = {
  title: "Home",
  description: "Customer portal home.",
};

export default async function Page() {
  const profile = await getCurrentCustomer();
  if (!profile) redirect("/login?returnTo=/portal");
  const token = await getCustomerAccessToken();
  const [bookings, onboardingAnswers] = await Promise.all([
    listMyBookings(serverFetcher(token), profile.id),
    getMyOnboarding(serverFetcher(token))
      .then((payload) => payload.onboarding)
      .catch(() => null),
  ]);

  return <PortalHome profile={profile} bookings={bookings} onboardingAnswers={onboardingAnswers} />;
}
