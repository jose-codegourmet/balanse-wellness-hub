import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Publish and manage sessions.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Schedule</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Publish and manage sessions. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
