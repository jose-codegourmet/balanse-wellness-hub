import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
import { MyBookingsPage } from "./_components/my-bookings-page/MyBookingsPage";

export const metadata: Metadata = {
  title: "My bookings",
  description: "View and manage all of your class reservations.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const principal = await getServerMockPrincipal();
  const { tab } = await searchParams;
  const bookings = await getMockAdapter().getBookings(principal.customerId);

  return <MyBookingsPage bookings={bookings} initialTab={tab} />;
}
