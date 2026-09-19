import { MarketingImage } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/jabkit/button";
import type { Hero33Feature } from "@/components/jabkit/hero-33/Hero33.types";
import { cn } from "@/lib/utils";

export type BalanseHeroAction = { label: string; href: string };

/** Jabkit controls composed with brand typography; content never depends on animation. */
export function BalanseHero({
  assetId,
  eyebrow,
  titleLines,
  primaryAction,
  secondaryAction,
  features = [],
  align = "start",
  className,
  headingLevel = 1,
}: {
  assetId: string;
  eyebrow?: string;
  titleLines: string[];
  primaryAction?: BalanseHeroAction;
  secondaryAction?: BalanseHeroAction;
  features?: Hero33Feature[];
  align?: "start" | "compact";
  className?: string;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section
      data-balanse-hero={assetId}
      className={cn(
        "marketing-container grid gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16",
        align === "compact" ? "md:py-14" : "md:py-20",
        className,
      )}
    >
      <div>
        {eyebrow ? <p className="marketing-eyebrow mb-5">{eyebrow}</p> : null}
        <Heading className="font-display text-4xl font-normal leading-[1.12] tracking-[-0.035em] lg:text-5xl">
          {titleLines.join(" ")}
        </Heading>
        {features.length ? (
          <p className="marketing-copy max-w-lg">{features[0].description.replace(/\n/g, " ")}</p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-5">
          {primaryAction ? (
            <Button asChild className="rounded-full px-6">
              <a href={primaryAction.href}>
                {primaryAction.label}
                <ArrowUpRight className="ml-3 size-4" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
          {secondaryAction ? (
            <a href={secondaryAction.href} className="marketing-text-link">
              {secondaryAction.label}
            </a>
          ) : null}
        </div>
      </div>
      <MarketingImage assetId={assetId} loading="eager" className="!rounded-sm" />
    </section>
  );
}
