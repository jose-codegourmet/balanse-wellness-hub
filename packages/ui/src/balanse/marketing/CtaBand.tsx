"use client";

import type { PublicCtaAction, PublicCtaBlock, PublicCtaTone } from "@balanse/domain";
import { type ButtonVariantProps, buttonVariants } from "../../components/button/Button";
import { cn } from "../../lib/utils";
import { MarketingImage } from "../assets/MarketingImage";
import { DefaultNavLink, type NavLinkComponent } from "../navigation/nav-link";
import { SectionHeading } from "./SectionHeading";

export type CtaBandSurface = "navy" | "cream";

const DefaultLink = DefaultNavLink;

const CTA_VARIANT: Record<
  CtaBandSurface,
  Record<PublicCtaTone, NonNullable<ButtonVariantProps["variant"]>>
> = {
  navy: { primary: "accent", accent: "outline", quiet: "link" },
  cream: { primary: "default", accent: "outline", quiet: "link" },
};

/**
 * Button styling for a public CTA. Gold leads on navy, navy leads on cream, so
 * the primary action always carries the highest contrast on its own ground.
 *
 * On navy the class list carries `dark`, which flips the theme tokens for the
 * element itself: `outline` and `link` then draw in warm white with a gold
 * focus ring instead of navy-on-navy.
 */
export function ctaActionClass(tone: PublicCtaTone, surface: CtaBandSurface): string {
  return cn(
    buttonVariants({ variant: CTA_VARIANT[surface][tone], size: "lg" }),
    surface === "navy" && "dark",
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
