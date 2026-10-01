import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { BookingDetail } from "@/modules/customer/BookingDetail";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { buildBookingInvite } from "@/modules/share/public-page";

export const metadata: Metadata = {
  title: "Booking detail",
  description: "Your current Balansé booking status, class details, and payment information.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const [booking, profile] = await Promise.all([
    getMockAdapter().getBooking(bookingId),
    getCurrentCustomer(),
  ]);

  // Customers only ever see their own bookings.
  if (!booking || booking.customerId !== profile?.id) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Booking detail</h1>
        <p className="mt-3 text-sm text-muted-foreground">We couldn't find that booking.</p>
      </section>
    );
  }

  const invite = await buildBookingInvite(booking, profile);
  return <BookingDetail booking={booking} profile={profile} invite={invite} />;
}
