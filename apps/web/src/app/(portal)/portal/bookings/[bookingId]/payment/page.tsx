import { getMyBooking } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { PaymentMethodPage } from "@/modules/customer/PaymentMethodPage";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";

export const metadata: Metadata = {
  title: "Payment",
  description: "Choose a Balansé payment method.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const profile = await getCurrentCustomer();
  const booking = profile
    ? await getMyBooking(
        serverFetcher(await getCustomerAccessToken()),
        bookingId,
        profile.id,
      ).catch(() => null)
    : null;
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
