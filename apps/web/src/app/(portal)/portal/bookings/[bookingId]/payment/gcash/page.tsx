import { getFormPolicies, getMyBooking, getPaymentInstructions } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { GcashProofPage } from "@/modules/customer/GcashProofPage";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";

export const metadata: Metadata = {
  title: "Online payment",
  description: "Pay by GCash, Maya, or QR Ph and upload proof for a Balansé reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const profile = await getCurrentCustomer();
  const [booking, instructions, policies] = await Promise.all([
    profile
      ? getMyBooking(serverFetcher(await getCustomerAccessToken()), bookingId, profile.id).catch(
          () => null,
        )
      : null,
    getPaymentInstructions(serverFetcher(await getCustomerAccessToken())).catch(() => null),
    getFormPolicies(serverFetcher(await getCustomerAccessToken()), "payment_proof")
      .then(({ items }) =>
        items.map((item) => ({
          id: item.id,
          documentName: item.documentName,
          version: item.version,
          promotedAt: "",
          current: true,
          body: item.body,
        })),
      )
      .catch(() => []),
  ]);
  if (!booking || !instructions) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Online payment</h1>
        <p className="mt-3 text-sm text-muted-foreground">That booking is not in this mock.</p>
      </section>
    );
  }
  return <GcashProofPage booking={booking} instructions={instructions} policies={policies} />;
}
