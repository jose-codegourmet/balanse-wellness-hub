import { getFormPolicies, getMyBooking, getPaymentInstructions } from "@balanse/api-client";
import type { PolicyDocumentVersion } from "@balanse/domain";
import { Button } from "@balanse/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { GcashPaymentWizard } from "./_components/gcash-payment-wizard/GcashPaymentWizard";

export const metadata: Metadata = {
  title: "Pay with GCash",
  description: "Send a GCash payment and upload the receipt for a Balansé reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const profile = await getCurrentCustomer();
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [booking, instructions, policies] = await Promise.all([
    profile ? getMyBooking(fetcher, bookingId, profile.id).catch(() => null) : null,
    // A failure here is shown inside the wizard; it must not hide the booking.
    getPaymentInstructions(fetcher).catch(() => null),
    getFormPolicies(fetcher, "payment_proof")
      .then(({ items }) =>
        items.map(
          (item): PolicyDocumentVersion => ({
            id: item.id,
            documentName: item.documentName,
            version: item.version,
            promotedAt: "",
            current: true,
            body: item.body,
          }),
        ),
      )
      .catch((): PolicyDocumentVersion[] => []),
  ]);

  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Booking not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find that booking on your account.
        </p>
        <Button className="mt-6" nativeButton={false} render={<Link href="/portal/bookings" />}>
          My bookings
        </Button>
      </section>
    );
  }
  return <GcashPaymentWizard booking={booking} instructions={instructions} policies={policies} />;
}
