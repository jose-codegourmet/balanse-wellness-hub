import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Browse Balansé class sessions on the Cebu calendar.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">This week at Balansé</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Public calendar mock. Schedule and Classes in the header jump here (OQ-NAV).
      </p>
      <div id="schedule" className="mt-8 scroll-mt-24 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl">Schedule</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Landing calendar placeholder. FE-PUB-001 owns the real calendar UI.
        </p>
      </div>
      <div id="classes" className="mt-6 scroll-mt-24 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl">Classes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Class filter placeholder. No dedicated Classes page is created.
        </p>
      </div>
      <p className="mt-8">
        <Link
          className="text-primary underline"
          href="/portal/bookings/new?sessionId=session-wed-open"
        >
          Reserve a sample session
        </Link>
      </p>
    </section>
  );
}
