import { listMyBookings } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { MyBookingsPage } from "./_components/my-bookings-page/MyBookingsPage";

export const metadata: Metadata = {
  title: "My bookings",
  description: "View and manage all of your class reservations.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const profile = await getCurrentCustomer();
  const { tab } = await searchParams;
  const token = await getCustomerAccessToken();
  const bookings = profile ? await listMyBookings(serverFetcher(token), profile.id) : [];

  return <MyBookingsPage bookings={bookings} initialTab={tab} />;
}
