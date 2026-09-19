"use client";

import type { PublicCtaAction, PublicCtaBlock, PublicCtaTone } from "@balanse/domain";
import { cn } from "../../lib/utils";
import { MarketingImage } from "../assets/MarketingImage";
import { DefaultNavLink, type NavLinkComponent } from "../navigation/nav-link";
import { SectionHeading } from "./SectionHeading";

export type CtaBandSurface = "navy" | "cream";

const DefaultLink = DefaultNavLink;

const BASE_ACTION =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/**
 * Button styling for a public CTA. Gold leads on navy, navy leads on cream, so
 * the primary action always carries the highest contrast on its own ground.
 */
export function ctaActionClass(tone: PublicCtaTone, surface: CtaBandSurface): string {
  if (surface === "navy") {
    const ring = "focus-visible:ring-accent focus-visible:ring-offset-[var(--balanse-navy)]";
    if (tone === "primary") {
      return cn(BASE_ACTION, ring, "bg-accent text-accent-foreground hover:bg-accent/85");
    }
    if (tone === "accent") {
      return cn(
        BASE_ACTION,
        ring,
        "border border-accent/60 text-[var(--balanse-warm-white)] hover:bg-accent/15",
      );
    }
    return cn(
      BASE_ACTION,
      ring,
      "px-3 text-[var(--balanse-beige)] underline-offset-4 hover:text-accent hover:underline",
    );
  }

  const ring = "focus-visible:ring-ring focus-visible:ring-offset-background";
  if (tone === "primary") {
    return cn(BASE_ACTION, ring, "bg-primary text-primary-foreground hover:bg-primary/85");
  }
  if (tone === "accent") {
    return cn(
      BASE_ACTION,
      ring,
      "border border-[var(--balanse-tan)] bg-card text-foreground hover:border-accent hover:bg-secondary/60",
    );
  }
  return cn(
    BASE_ACTION,
    ring,
    "px-3 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
  );
}

export function CtaActionLink({
  action,
  surface,
  link: Link = DefaultLink,
  className,
}: {
  action: PublicCtaAction;
  surface: CtaBandSurface;
  link?: NavLinkComponent;
  className?: string;
}) {
  const classes = cn(ctaActionClass(action.tone, surface), className);
  if (action.external) {
    return (
      <a href={action.href} className={classes} rel="noreferrer" target="_blank">
        {action.label}
      </a>
    );
  }
  return (
    <Link href={action.href} className={classes}>
      {action.label}
    </Link>
  );
}

/**
 * Closing call-to-action for a public page. `block` comes from the domain CTA
 * catalog, so no page invents its own copy or dead button.
 */
export function CtaBand({
  block,
  surface = "navy",
  link,
  className,
  sectionName = "cta-band",
}: {
  block: PublicCtaBlock;
  surface?: CtaBandSurface;
  link?: NavLinkComponent;
  className?: string;
  /** Overridden by the landing page so the spec's `final-cta` section id survives. */
  sectionName?: string;
}) {
  const navy = surface === "navy";
  return (
    <section
      data-section={sectionName}
      data-cta-id={block.id}
      className={cn(
        "relative isolate overflow-hidden",
        navy ? "bg-[var(--balanse-navy)]" : "bg-secondary/40",
        className,
      )}
    >
      {block.assetId ? (
        <div className="pointer-events-none absolute inset-0 -z-10">
          <MarketingImage
            assetId={block.assetId}
            decorative
            frameTone={navy ? "navy" : "cream"}
            className="size-full rounded-none"
          />
          <div
            className={cn(
              "absolute inset-0",
              navy
                ? "bg-[linear-gradient(100deg,var(--balanse-navy)_28%,color-mix(in_oklab,var(--balanse-navy)_72%,transparent)_70%,transparent)]"
                : "bg-[linear-gradient(100deg,var(--balanse-cream)_30%,color-mix(in_oklab,var(--balanse-cream)_70%,transparent)_72%,transparent)]",
            )}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <SectionHeading
          eyebrow={block.eyebrow}
          title={block.title}
          description={block.body}
          tone={navy ? "inverse" : "light"}
          className="max-w-3xl sm:flex-col sm:items-start"
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {block.actions.map((action) => (
            <CtaActionLink key={action.id} action={action} surface={surface} link={link} />
          ))}
        </div>
      </div>
    </section>
  );
}
