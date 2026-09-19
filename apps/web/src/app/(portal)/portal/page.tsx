import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My bookings",
  description: "Customer portal home and booking list.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Home / My bookings</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Portal shell. FE-CUS-004 owns cards and grouping.
      </p>
    </section>
  );
}
