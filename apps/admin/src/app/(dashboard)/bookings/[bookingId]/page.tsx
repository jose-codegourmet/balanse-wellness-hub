import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingDetailQuery, adminCustomersQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { BookingDetailPage } from "../_components/booking-pages/BookingPages";

export const metadata: Metadata = {
  title: "Booking",
  description: "Review a booking.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminBookingDetailQuery(actor, bookingId, serverFetcher(token)),
      adminCustomersQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <BookingDetailPage bookingId={bookingId} />
    </AdminQuerySuspense>,
  );
}
