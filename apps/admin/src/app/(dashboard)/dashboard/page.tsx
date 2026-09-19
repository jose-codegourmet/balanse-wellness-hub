import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operations overview.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Operations overview. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
