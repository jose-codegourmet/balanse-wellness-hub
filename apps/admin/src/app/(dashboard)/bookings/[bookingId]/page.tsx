import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingDetailQuery, adminCustomersQuery } from "@/lib/query/queries";
import { BookingDetailPage } from "../_components/booking-pages/BookingPages";

export const metadata: Metadata = {
  title: "Booking",
  description: "Review a booking.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminBookingDetailQuery(principal, bookingId), adminCustomersQuery(principal)],
    <AdminQuerySuspense>
      <BookingDetailPage bookingId={bookingId} />
    </AdminQuerySuspense>,
  );
}
