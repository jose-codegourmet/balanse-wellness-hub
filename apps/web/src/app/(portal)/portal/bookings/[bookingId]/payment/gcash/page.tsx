import type { Metadata } from "next";
import { GcashProofDemo } from "@/components/balanse/GcashProofDemo";

export const metadata: Metadata = {
  title: "GCash proof",
  description: "GCash proof mock shell for Balansé.",
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
      <h1 className="font-display text-3xl">GCash proof</h1>
      <p className="mt-3 text-muted-foreground">Booking {bookingId}</p>
      {sessionId ? <p className="text-sm">Session {sessionId}</p> : null}
      <div className="mt-8 max-w-lg">
        <GcashProofDemo />
      </div>
    </section>
  );
}
