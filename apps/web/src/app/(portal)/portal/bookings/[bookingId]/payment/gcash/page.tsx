import { getMockAdapter, getMockRuntime } from "@balanse/mock";
import type { Metadata } from "next";
import { GcashProofPage } from "@/modules/customer/GcashProofPage";

export const metadata: Metadata = {
  title: "Online payment",
  description: "Pay by GCash, Maya, or QR Ph and upload proof for a Balansé reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const adapter = getMockAdapter();
  const [booking, instructions, policies] = await Promise.all([
    adapter.getBooking(bookingId),
    adapter.getPaymentInstructions(),
    adapter.getCustomerFormPolicies("payment_proof"),
  ]);
  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Online payment</h1>
        <p className="mt-3 text-sm text-muted-foreground">That booking is not in this mock.</p>
      </section>
    );
  }
  return (
    <GcashProofPage
      booking={booking}
      instructions={instructions}
      policies={policies}
      forceFailure={getMockRuntime().failProofUpload}
    />
  );
}
