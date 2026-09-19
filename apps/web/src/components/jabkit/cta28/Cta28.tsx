"use client";

import {
  ArrowRightIcon,
  GaugeIcon,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/jabkit/button";
import { cn } from "@/lib/cn";
import type {
  Cta28Action,
  Cta28Feature,
  Cta28FeatureIcon,
  Cta28Photo,
  Cta28Props,
} from "./Cta28.types";

const DEFAULT_TITLE = "Run the next quarter\nfrom one room.";
const DEFAULT_DESCRIPTION =
  "Keep briefs, handoffs, and the live record in the same canvas so operators walk in already knowing the next move.";

const DEFAULT_FEATURES: Cta28Feature[] = [
  { icon: "shield", label: "Policy-aware workflows" },
  { icon: "workflow", label: "Shared operator canvas" },
  { icon: "users", label: "Shift-proof handoffs" },
  { icon: "gauge", label: "Status without a scavenger hunt" },
  { icon: "lock", label: "Role-based access" },
  { icon: "sparkles", label: "Audit-ready history" },
];

const DEFAULT_ACTION: Cta28Action = {
  label: "Start a workspace",
  href: "#start",
};

const DEFAULT_PHOTOS: Cta28Photo[] = [
  {
    src: "/assets/f3a024ac28ac96a1.webp",
    alt: "Operators gathered around a long table during a planning session",
  },
  {
    src: "/assets/0d5b296cb8b10e6a.webp",
    alt: "Bright open studio with a communal work table",
  },
  {
    src: "/assets/ff0adba6f88d3473.webp",
    alt: "Close crop of a laptop and notes on a desk",
  },
];

const FEATURE_ICONS: Record<Cta28FeatureIcon, typeof ShieldCheckIcon> = {
  shield: ShieldCheckIcon,
  workflow: WorkflowIcon,
  users: UsersIcon,
  gauge: GaugeIcon,
  lock: LockIcon,
  sparkles: SparklesIcon,
};

function FeatureGlyph({ name }: { name?: Cta28FeatureIcon }) {
  const Icon = FEATURE_ICONS[name ?? "sparkles"];
  return <Icon aria-hidden="true" className="size-4 shrink-0 stroke-[1.75]" />;
}

function CtaAction({ action }: { action: Cta28Action }) {
  const className =
    "h-12 w-full justify-between gap-4 rounded-[--radius] bg-foreground px-5 text-background shadow-[0_18px_40px_-22px_color-mix(in_oklab,var(--jk-foreground),transparent_30%)] hover:brightness-110";

  const label = (
    <>
      <span>{action.label}</span>
      <ArrowRightIcon aria-hidden="true" className="size-4 stroke-[1.75]" />
    </>
  );

  if (action.href) {
    return (
      <Button variant="primary" size="lg" className={className} asChild>
        <a href={action.href}>{label}</a>
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      className={className}
      onClick={action.onClick}
    >
      {label}
    </Button>
  );
}

const PHOTO_FRAMES = [
  "absolute top-[8%] right-[4%] z-20 h-[72%] w-[58%] rotate-[2deg]",
  "absolute bottom-[6%] left-[2%] z-30 h-[46%] w-[52%] -rotate-[4deg]",
  "absolute top-[4%] left-[10%] z-10 h-[38%] w-[36%] rotate-[-7deg] opacity-70",
] as const;

function PhotoCollage({ photos }: { photos: Cta28Photo[] }) {
  if (photos.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="relative hidden min-h-[28rem] overflow-hidden xl:block"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklab,var(--jk-muted)_55%,transparent),transparent_68%)]" />
      {photos.slice(0, PHOTO_FRAMES.length).map((photo, index) => (
        <figure
          key={photo.src}
          className={cn(
            "overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border border-border/60 shadow-[0_28px_56px_-28px_color-mix(in_oklab,var(--jk-foreground),transparent_45%)]",
            PHOTO_FRAMES[index],
          )}
        >
          <img src={photo.src} alt="" className="size-full object-cover" />
        </figure>
      ))}
    </div>
  );
}

export function Cta28({
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  features = DEFAULT_FEATURES,
  action = DEFAULT_ACTION,
  photos = DEFAULT_PHOTOS,
  ...props
}: Cta28Props) {
  const headingId = useId();
  const titleLines = title.split("\n").filter((line) => line.length > 0);

  return (
    <section
      data-slot="cta28"
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      <div className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="dark overflow-hidden rounded-[calc(var(--radius)+0.65rem)] border border-border bg-background text-foreground shadow-[0_32px_72px_-40px_color-mix(in_oklab,var(--jk-foreground),transparent_55%)]">
          <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <header className="max-w-xl">
                <h2
                  id={headingId}
                  className="font-serif text-4xl leading-[1.12] font-normal tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl"
                >
                  {titleLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                {description ? (
                  <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                    {description}
                  </p>
                ) : null}
              </header>

              {features.length > 0 ? (
                <ul className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-2.5 text-sm leading-6 text-foreground sm:text-[0.95rem]"
                    >
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center text-foreground">
                        <FeatureGlyph name={feature.icon} />
                      </span>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="max-w-xl">
                <CtaAction action={action} />
              </div>
            </div>

            <PhotoCollage photos={photos} />
          </div>
        </div>
      </div>
    </section>
  );
}
