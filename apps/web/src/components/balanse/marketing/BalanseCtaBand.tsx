"use client";

import { type PublicCtaBlockId, publicCtaBlock } from "@balanse/domain";
import type { Hero33FeatureIcon } from "@/components/jabkit/hero-33/Hero33.types";
import { BalanseHero } from "./BalanseHero";

/**
 * Secondary marketing invitation using the same brand composition and Jabkit
 * controls as the public-page hero. Uses an h2 to preserve page hierarchy.
 */
export function BalanseCtaBand({
  blockId,
  supportingTitle,
  icon = "monitor",
  sectionName = "cta-band",
  className,
}: {
  blockId: PublicCtaBlockId;
  supportingTitle: string;
  icon?: Hero33FeatureIcon;
  sectionName?: string;
  className?: string;
}) {
  const block = publicCtaBlock(blockId);
  const [primary, secondary] = block.actions;

  if (!block.assetId) return null;

  return (
    <div data-section={sectionName} data-cta-id={block.id} className={className}>
      <BalanseHero
        headingLevel={2}
        assetId={block.assetId}
        eyebrow={block.eyebrow}
        titleLines={[block.title]}
        primaryAction={primary ? { label: primary.label, href: primary.href } : undefined}
        secondaryAction={secondary ? { label: secondary.label, href: secondary.href } : undefined}
        features={[{ icon, title: supportingTitle, description: block.body }]}
        align="compact"
      />
    </div>
  );
}
