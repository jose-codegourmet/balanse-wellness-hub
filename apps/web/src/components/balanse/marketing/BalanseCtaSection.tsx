import { type PublicCtaBlockId, publicCtaBlock } from "@balanse/domain";
import { MarketingImage } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/jabkit/button";
import type { Cta28Feature } from "@/components/jabkit/cta28/Cta28.types";
import { cn } from "@/lib/utils";

/** Quiet closing invitation using Jabkit controls and one full-width photograph. */
export function BalanseCtaSection({
  blockId,
  assetIds = [],
  sectionName = "cta-band",
  className,
}: {
  blockId: PublicCtaBlockId;
  assetIds?: string[];
  features?: Cta28Feature[];
  sectionName?: string;
  className?: string;
}) {
  const block = publicCtaBlock(blockId);
  const [primary] = block.actions;
  return (
    <section
      data-section={sectionName}
      data-cta-id={block.id}
      className={cn("marketing-container pb-16 md:pb-24", className)}
    >
      {assetIds[0] ? (
        <MarketingImage assetId={assetIds[0]} className="mb-8 !rounded-sm md:mb-10" />
      ) : null}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="marketing-title">{block.title}</h2>
          <p className="marketing-copy max-w-lg">{block.body}</p>
        </div>
        <Button asChild className="rounded-full px-7">
          <a href={primary.href}>
            {primary.label}
            <ArrowUpRight className="ml-4 size-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </section>
  );
}
