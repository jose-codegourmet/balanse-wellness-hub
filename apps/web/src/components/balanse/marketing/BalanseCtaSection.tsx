"use client";

import { type PublicCtaBlockId, publicCtaBlock } from "@balanse/domain";
import { Cta28 } from "@/components/jabkit/cta28";
import type { Cta28Feature, Cta28Photo } from "@/components/jabkit/cta28/Cta28.types";
import { cn } from "@/lib/utils";
import { marketingSlotImage } from "./asset-src";

/**
 * Closing CTA for a public page, built on Jabkit `cta28`.
 *
 * Copy and destinations come from the domain CTA catalog so no page invents a
 * headline or a button that goes nowhere. The kit ships a single wide action;
 * the catalog's remaining actions render as a secondary row beneath it.
 */
export function BalanseCtaSection({
  blockId,
  assetIds = [],
  features = [],
  sectionName = "cta-band",
  className,
}: {
  blockId: PublicCtaBlockId;
  /** Manifest slots for the kit's photo collage. Unresolved slots are dropped. */
  assetIds?: string[];
  features?: Cta28Feature[];
  sectionName?: string;
  className?: string;
}) {
  const block = publicCtaBlock(blockId);
  const [primary, ...rest] = block.actions;
  const photos = assetIds
    .map((id) => marketingSlotImage(id))
    .filter((image): image is NonNullable<typeof image> => image !== null)
    .map<Cta28Photo>((image) => ({ src: image.src, alt: image.alt }));

  return (
    <div data-section={sectionName} data-cta-id={block.id} className={cn("relative", className)}>
      <Cta28
        title={block.title}
        description={block.body}
        features={features}
        action={{ label: primary.label, href: primary.href }}
        photos={photos}
        className="bg-transparent [&_h2]:font-display"
      />

      {rest.length > 0 ? (
        <div className="mx-auto -mt-6 flex max-w-[90rem] flex-wrap items-center gap-3 px-5 pb-12 sm:px-8 sm:pb-16 lg:px-10">
          {rest.map((action) => (
            <a
              key={action.id}
              href={action.href}
              className="inline-flex h-11 items-center rounded-full border border-[var(--balanse-tan)] bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
