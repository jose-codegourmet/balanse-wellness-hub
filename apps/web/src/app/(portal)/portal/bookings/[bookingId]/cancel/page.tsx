import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { CancellationRequest } from "@/modules/customer/CancellationRequest";

export const metadata: Metadata = {
  title: "Request cancellation",
  description: "Ask the studio to cancel a reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = await getMockAdapter().getBooking(bookingId);
  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Request cancellation</h1>
        <p className="mt-3 text-sm text-muted-foreground">That booking is not in this mock.</p>
      </section>
    );
  }
  return <CancellationRequest booking={booking} />;
}
