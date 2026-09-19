"use client";

import { type PublicCtaBlockId, publicCtaBlock } from "@balanse/domain";
import type { Hero33FeatureIcon } from "@/components/jabkit/hero-33/Hero33.types";
import { BalanseHero } from "./BalanseHero";

/**
 * Full-bleed 21:9 CTA band for the pass-2 wide slots (`landing-e`, `about-d`).
 *
 * Shares the Jabkit `hero-33` chrome with {@link BalanseHero} — that block is
 * the right shape for a cinematic band carrying a headline and two actions —
 * but takes CTA semantics and copy from the domain CTA catalog. The block's
 * supporting line rides in the kit's own feature slot rather than a bolted-on
 * paragraph.
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
