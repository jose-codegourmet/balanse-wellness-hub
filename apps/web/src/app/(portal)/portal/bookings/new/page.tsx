import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a session",
  description: "Confirm a Balansé class reservation.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Booking form</h1>
      <p className="mt-3 text-muted-foreground">Selected session: {sessionId ?? "none"}</p>
      <p className="mt-2 text-sm">
        Session id is preserved across booking-flow steps. FE-CUS-008 owns the form.
      </p>
    </section>
  );
}
