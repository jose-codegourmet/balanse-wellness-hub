import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Meet the Balansé coaching roster.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Coaches</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Page shell only. Headshots stay placeholders until ASSET tickets land.
      </p>
    </section>
  );
}
