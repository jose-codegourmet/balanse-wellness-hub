import { publicPageSlotIds } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { CoachPhoto, MarketingImage } from "@balanse/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Meet the Balansé coaching roster.",
};

export default async function Page() {
  const coaches = await getMockAdapter().getPublicCoaches();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">Coaches</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Photos resolve from each coach record. Missing files use the ASSET-014 placeholder.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {publicPageSlotIds("coaches").map((id) => (
          <MarketingImage key={id} assetId={id} />
        ))}
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <li key={coach.id} className="rounded-xl border border-border bg-card p-4">
            <CoachPhoto photoKey={coach.photoKey} name={coach.name} ratio="4:5" />
            <h2 className="mt-3 font-display text-xl">{coach.name}</h2>
            <p className="text-sm text-muted-foreground">{coach.specialties.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
