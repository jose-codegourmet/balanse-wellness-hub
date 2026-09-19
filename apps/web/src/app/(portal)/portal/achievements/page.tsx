import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements (TBD)",
  description: "Achievements are not in MVP scope.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Achievements (TBD)</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Nav item required by the spec. Content is intentionally TBD.
      </p>
    </section>
  );
}
