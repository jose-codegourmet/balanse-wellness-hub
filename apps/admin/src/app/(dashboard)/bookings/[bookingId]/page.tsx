import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBookingDetailQuery, adminCustomersQuery } from "@/lib/query/queries";
import { BookingDetailPage } from "@/modules/admin/BookingPages";

export const metadata: Metadata = {
  title: "Booking",
  description: "Review a booking.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminBookingDetailQuery(principal.role, bookingId), adminCustomersQuery(principal.role)],
    <BookingDetailPage bookingId={bookingId} />,
  );
}
