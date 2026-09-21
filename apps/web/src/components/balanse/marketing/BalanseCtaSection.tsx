import { type PublicCtaBlockId, publicCtaBlock } from "@balanse/domain";
import { MarketingImage, ScrollReveal } from "@balanse/ui";
import {
  ArrowUpRight,
  GaugeIcon,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import { Button } from "@/components/jabkit/button";
import type { Cta28Feature, Cta28FeatureIcon } from "@/components/jabkit/cta28/Cta28.types";
import { cn } from "@/lib/utils";
import "./cta-section.css";

/** Same glyph vocabulary as the vendored Jabkit cta28, kept pristine. */
const FEATURE_ICONS: Record<Cta28FeatureIcon, typeof ShieldCheckIcon> = {
  shield: ShieldCheckIcon,
  workflow: WorkflowIcon,
  users: UsersIcon,
  gauge: GaugeIcon,
  lock: LockIcon,
  sparkles: SparklesIcon,
};

/**
 * Quiet closing invitation shared by every public page.
 *
 * Copy comes from `publicCtaBlock()` so it stays versioned with the rest of
 * the CTA catalog, and the photograph slot is optional: a block without an
 * asset renders as a composed type-and-action band, which is what lets
 * `/coaches` ship ahead of its group hero (FE-PUB-006).
 */
export function BalanseCtaSection({
  blockId,
  assetIds = [],
  features = [],
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
  const assetId = assetIds[0] ?? block.assetId;

  return (
    <section
      data-section={sectionName}
      data-cta-id={block.id}
      className={cn("balanse-cta marketing-container pb-16 md:pb-24", className)}
    >
      {assetId ? (
        <ScrollReveal>
          <MarketingImage assetId={assetId} className="mb-8 !rounded-sm md:mb-10" />
        </ScrollReveal>
      ) : null}
      <ScrollReveal delay={assetId ? 0.08 : 0}>
        <div className="balanse-cta-body">
          <div className="balanse-cta-copy">
            <p className="marketing-eyebrow">{block.eyebrow}</p>
            <h2 className="marketing-title mt-3">{block.title}</h2>
            <p className="marketing-copy max-w-lg">{block.body}</p>
          </div>
          {/* Exactly one primary action. Any secondary action on the block stays
            in the footer nav rather than competing here. */}
          <Button asChild className="balanse-cta-action rounded-full px-7">
            <a href={primary.href}>
              {primary.label}
              <ArrowUpRight className="ml-4 size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </ScrollReveal>
      {features.length > 0 ? (
        <ScrollReveal delay={0.12}>
          <ul className="balanse-cta-features">
            {features.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon ?? "sparkles"];
              return (
                <li key={feature.label}>
                  <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
                  <span>{feature.label}</span>
                </li>
              );
            })}
          </ul>
        </ScrollReveal>
      ) : null}
    </section>
  );
}
