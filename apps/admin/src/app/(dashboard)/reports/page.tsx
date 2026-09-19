import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Sales and inventory reports.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Reports</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Sales and inventory reports. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
