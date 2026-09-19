import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Review customer reservations.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Bookings</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Review customer reservations. Screen content is owned by the matching FE-ADM ticket.
      </p>
    </section>
  );
}
