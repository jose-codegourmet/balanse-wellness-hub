import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reschedules",
  description: "Reschedule requests.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Reschedules</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Reschedule requests. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
