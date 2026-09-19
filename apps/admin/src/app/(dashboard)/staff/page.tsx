import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
  description: "Admin access management.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Staff</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Admin access management. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
