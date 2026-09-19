import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { BookingDetail } from "@/modules/customer/BookingDetail";
import { getServerMockPrincipal } from "@/modules/session/server-principal";

export const metadata: Metadata = {
  title: "Booking detail",
  description: "Booking confirmation for Balansé.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const [booking, profile] = await Promise.all([
    adapter.getBooking(bookingId),
    adapter.getMe(principal.customerId),
  ]);

  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Booking detail</h1>
        <p className="mt-3 text-sm text-muted-foreground">That booking is not in this mock.</p>
      </section>
    );
  }

  return <BookingDetail booking={booking} profile={profile} />;
}
