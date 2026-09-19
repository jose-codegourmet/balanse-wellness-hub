import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about booking at Balansé.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">FAQs</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Page shell only. FE-PUB-004 owns the list.
      </p>
    </section>
  );
}
