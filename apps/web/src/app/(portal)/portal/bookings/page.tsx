import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { MyBookingsPage } from "./_components/my-bookings-page/MyBookingsPage";

export const metadata: Metadata = {
  title: "My bookings",
  description: "View and manage all of your class reservations.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const profile = await getCurrentCustomer();
  const { tab } = await searchParams;
  const bookings = profile ? await getMockAdapter().getBookings(profile.id) : [];

  return <MyBookingsPage bookings={bookings} initialTab={tab} />;
}
