import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment method",
  description: "Payment method mock shell for Balansé.",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { bookingId } = await params;
  const { sessionId } = await searchParams;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Payment method</h1>
      <p className="mt-3 text-muted-foreground">Booking {bookingId}</p>
      {sessionId ? <p className="text-sm">Session {sessionId}</p> : null}
    </section>
  );
}
