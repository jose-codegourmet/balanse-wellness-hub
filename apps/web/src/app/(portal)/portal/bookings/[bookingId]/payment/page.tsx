import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { PaymentMethodPage } from "@/modules/customer/PaymentMethodPage";

export const metadata: Metadata = {
  title: "Payment",
  description: "Choose a Balansé payment method.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = await getMockAdapter().getBooking(bookingId);
  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Payment</h1>
        <p className="mt-3 text-sm text-muted-foreground">That booking is not in this mock.</p>
      </section>
    );
  }
  return <PaymentMethodPage booking={booking} />;
}
