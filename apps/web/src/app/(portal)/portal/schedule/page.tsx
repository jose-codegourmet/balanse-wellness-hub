import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Customer schedule calendar.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Schedule</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Portal shell. FE-CUS-007 owns the calendar.
      </p>
    </section>
  );
}
