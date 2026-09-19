"use client";

import { Hero33 } from "@/components/jabkit/hero-33";
import type { Hero33Feature } from "@/components/jabkit/hero-33/Hero33.types";
import { cn } from "@/lib/utils";
import { marketingSlotImage } from "./asset-src";

export type BalanseHeroAction = {
  label: string;
  href: string;
};

/** Transparent pixel: keeps the kit's `<img>` valid when a slot has no art. */
const BLANK_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Public page hero built on Jabkit `hero-33`.
 *
 * Wrapper-level overrides only — the vendored source stays pristine:
 * - the kit's header row is hidden because `PublicNav` owns nav chrome
 *   sitewide, so no duplicate brand mark or dead control ships;
 * - the kit's aviation glyph on the primary action is suppressed;
 * - full-viewport height is relaxed so the landing calendar stays near the fold.
 *
 * Contrast is owned here rather than by the kit: a navy scrim sits between the
 * marketing photo (z-0) and the hero copy (z-10).
 */
export function BalanseHero({
  assetId,
  eyebrow,
  titleLines,
  primaryAction,
  secondaryAction,
  features = [],
  align = "start",
  className,
}: {
  assetId: string;
  eyebrow?: string;
  titleLines: string[];
  primaryAction?: BalanseHeroAction;
  secondaryAction?: BalanseHeroAction;
  features?: Hero33Feature[];
  align?: "start" | "compact";
  className?: string;
}) {
  const image = marketingSlotImage(assetId);

  return (
    <div data-balanse-hero={assetId} className={cn("relative isolate overflow-hidden", className)}>
      <Hero33
        navItems={[]}
        headerAction={undefined}
        brand=""
        brandHref="/"
        titleLines={titleLines}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        features={features}
        backgroundImage={image?.src ?? BLANK_PIXEL}
        backgroundAlt={image?.alt ?? ""}
        className={cn(
          "min-h-[auto] bg-[var(--balanse-navy)]",
          // The kit sets no face on its headline; Fraunces is the brand display.
          "[&_h1]:font-display [&_h1]:tracking-[-0.02em]",
          "[&_nav:first-of-type]:hidden",
          "[&_.lucide-plane-takeoff]:hidden",
          "[&>div]:min-h-[auto] [&>div]:px-6 md:[&>div]:px-12 lg:[&>div]:px-20",
          align === "compact"
            ? "[&>div]:pt-12 [&>div]:pb-12 md:[&>div]:pt-16 md:[&>div]:pb-16"
            : "[&>div]:pt-14 [&>div]:pb-14 md:[&>div]:pt-20 md:[&>div]:pb-20",
        )}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(100deg,color-mix(in_oklab,var(--balanse-navy)_90%,transparent)_8%,color-mix(in_oklab,var(--balanse-navy)_68%,transparent)_54%,color-mix(in_oklab,var(--balanse-navy)_36%,transparent))]"
      />

      {eyebrow ? (
        <p className="pointer-events-none absolute inset-x-0 top-6 z-20 mx-auto flex max-w-7xl items-center gap-2 px-6 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent md:px-12 md:top-8 lg:px-20">
          <span aria-hidden="true" className="h-px w-6 bg-accent/70" />
          {eyebrow}
        </p>
      ) : null}
    </div>
  );
}
