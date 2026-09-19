import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments",
  description: "GCash, cash, and refunds.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Payments</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        GCash, cash, and refunds. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
