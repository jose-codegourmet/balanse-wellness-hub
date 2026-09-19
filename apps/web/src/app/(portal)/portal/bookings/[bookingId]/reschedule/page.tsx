import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { RescheduleRequest } from "@/modules/customer/RescheduleRequest";

export const metadata: Metadata = {
  title: "Request reschedule",
  description: "Ask the studio to move a reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const adapter = getMockAdapter();
  const [booking, sessions] = await Promise.all([
    adapter.getBooking(bookingId),
    adapter.getPublicSessions(),
  ]);
  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Request reschedule</h1>
        <p className="mt-3 text-sm text-muted-foreground">That booking is not in this mock.</p>
      </section>
    );
  }
  return <RescheduleRequest booking={booking} sessions={sessions} />;
}
