import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingsQuery, adminClassesQuery, adminCustomersQuery } from "@/lib/query/queries";
import { BookingListPage } from "./_components/booking-pages/BookingPages";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Booking management.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminBookingsQuery(principal), adminClassesQuery(principal), adminCustomersQuery(principal)],
    <AdminQuerySuspense>
      <BookingListPage />
    </AdminQuerySuspense>,
  );
}
