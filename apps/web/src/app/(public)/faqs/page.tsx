import { publicPageSlotIds } from "@balanse/domain";
import { MarketingImage } from "@balanse/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about booking at Balansé.",
};

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl">FAQs</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Page shell only. FE-PUB-004 owns the list. Image slots come from the asset manifest.
      </p>
      <div className="mt-8 max-w-xl">
        {publicPageSlotIds("faqs").map((id) => (
          <MarketingImage key={id} assetId={id} />
        ))}
      </div>
    </section>
  );
}
