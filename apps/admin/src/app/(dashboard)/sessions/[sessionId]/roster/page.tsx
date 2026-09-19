import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session roster",
  description: "Check-in and no-show.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Session roster</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Check-in and no-show. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
