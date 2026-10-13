import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingsQuery, adminClassesQuery, adminCustomersQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { BookingListPage } from "./_components/booking-pages/BookingPages";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Booking management.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminBookingsQuery(actor, undefined, serverFetcher(token)),
      adminClassesQuery(actor, serverFetcher(token)),
      adminCustomersQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <BookingListPage />
    </AdminQuerySuspense>,
  );
}
