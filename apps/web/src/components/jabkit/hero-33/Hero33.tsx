"use client";

import {
  ArmchairIcon,
  MonitorIcon,
  PlaneTakeoffIcon,
} from "lucide-react";
import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  Hero33Action,
  Hero33FeatureIcon,
  Hero33Props,
} from "./Hero33.types";

const defaultNavItems = [
  { label: "Flights", href: "#flights" },
  { label: "Destinations", href: "#destinations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const defaultHeaderAction: Hero33Action = {
  label: "Book Now",
  href: "#book",
};

const defaultPrimaryAction: Hero33Action = {
  label: "Explore Flights",
  href: "#flights",
};

const defaultSecondaryAction: Hero33Action = {
  label: "Learn More",
  href: "#about",
};

const defaultTitleLines = [
  "Peak Moments,",
  "Unforgettable",
  "Journeys.",
];

const defaultFeatures = [
  {
    icon: "armchair" as const,
    title: "Premium Comfort",
    description: "Relax in spacious, luxurious\nseating",
  },
  {
    icon: "monitor" as const,
    title: "Stunning Views",
    description: "Marvel at the world from\nnew heights",
  },
];

const defaults = {
  brand: "Watermelon",
  brandHref: "#home",
  backgroundImage: "/assets/88b829c7028a2016.webp",
  backgroundAlt: "Airplane window sunset view",
} as const;

const featureIcons: Record<
  Hero33FeatureIcon,
  (props: { className?: string; strokeWidth?: number }) => ReactNode
> = {
  armchair: (props) => <ArmchairIcon {...props} />,
  monitor: (props) => <MonitorIcon {...props} />,
  "plane-takeoff": (props) => <PlaneTakeoffIcon {...props} />,
};

const overlayText = "text-card dark:text-foreground";
const overlayMuted = "text-card/60 dark:text-foreground/60";
const overlaySoft = "text-card/90 dark:text-foreground/90";
const amberStroke = "border-warning";
const glassFill = "bg-card/5 dark:bg-foreground/5";
const glassHover = "hover:bg-card/10 dark:hover:bg-foreground/10";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function NativeControl({
  action,
  className,
  style,
  children,
}: {
  action: Hero33Action;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (action.href) {
    return (
      <a href={action.href} className={className} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={action.onClick}
    >
      {children}
    </button>
  );
}

export function Hero33({
  className,
  brand = defaults.brand,
  brandHref = defaults.brandHref,
  navItems = defaultNavItems,
  headerAction = defaultHeaderAction,
  titleLines = defaultTitleLines,
  primaryAction = defaultPrimaryAction,
  secondaryAction = defaultSecondaryAction,
  features = defaultFeatures,
  backgroundImage = defaults.backgroundImage,
  backgroundAlt = defaults.backgroundAlt,
  ...props
}: Hero33Props) {
  const headingId = useId();

  return (
    <section
      data-slot="hero-33"
      aria-labelledby={headingId}
      className={cn(
        "relative min-h-[100dvh] w-full overflow-hidden bg-background font-sans antialiased",
        "selection:bg-card/20 dark:selection:bg-foreground/20",
        className,
      )}
      {...props}
    >
      <style href="jk-hero-33" precedence="default">{`
        @keyframes jk-hero33-nav {
          from { opacity: 0; transform: translateY(-16px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes jk-hero33-title {
          from { opacity: 0; transform: translateX(-32px) skewX(2deg); filter: blur(8px); }
          to { opacity: 1; transform: translateX(0) skewX(0deg); filter: blur(0); }
        }
        @keyframes jk-hero33-cta {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes jk-hero33-feature {
          from { opacity: 0; transform: translateY(20px) scale(0.97); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .jk-hero33-nav {
          animation: jk-hero33-nav 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .jk-hero33-title-line {
          animation: jk-hero33-title 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .jk-hero33-cta {
          animation: jk-hero33-cta 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .jk-hero33-feature {
          animation: jk-hero33-feature 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .jk-hero33-nav,
          .jk-hero33-title-line,
          .jk-hero33-cta,
          .jk-hero33-feature {
            animation: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
        />
      </div>
      <p className="sr-only">{backgroundAlt}</p>

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-6 pt-6 pb-12 md:px-12 lg:px-20">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <nav className="jk-hero33-nav flex items-center justify-between">
            <a
              href={brandHref}
              className={cn(
                "flex items-center text-2xl font-bold tracking-tight",
                overlayText,
                focusRing,
              )}
            >
              {brand}
              <span className="text-warning">.</span>
            </a>
            {navItems.length ? (
              <div className="hidden items-center gap-10 md:flex">
                {navItems.map((item) => (
                  <a
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      overlaySoft,
                      "hover:text-card dark:hover:text-foreground",
                      focusRing,
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
            {headerAction ? (
              <NativeControl
                action={headerAction}
                className={cn(
                  "rounded-md border px-6 py-2.5 text-sm font-medium transition-transform",
                  amberStroke,
                  overlayText,
                  glassHover,
                  "active:scale-[0.96] motion-reduce:active:scale-100",
                  focusRing,
                )}
              >
                {headerAction.label}
              </NativeControl>
            ) : null}
          </nav>

          <div className="flex flex-1 flex-col justify-center">
            <div className="flex max-w-3xl flex-col items-start">
              <h1
                id={headingId}
                className={cn(
                  "overflow-hidden text-5xl font-normal tracking-tight md:text-7xl lg:text-7xl lg:leading-[1.05]",
                  overlayText,
                )}
              >
                {titleLines.map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className="jk-hero33-title-line block"
                    style={{ animationDelay: `${0.3 + index * 0.14}s` }}
                  >
                    {line}
                  </span>
                ))}
              </h1>

              {primaryAction || secondaryAction ? (
                <div className="mt-10 flex items-center gap-4">
                  {primaryAction ? (
                    <NativeControl
                      action={primaryAction}
                      style={{ animationDelay: "0.85s" }}
                      className={cn(
                        "jk-hero33-cta flex h-12 items-center gap-2 rounded-md bg-card pr-5 pl-6 text-sm font-semibold text-card-foreground",
                        "dark:bg-foreground dark:text-background",
                        "transition-transform hover:opacity-90 active:scale-[0.96] motion-reduce:active:scale-100",
                        focusRing,
                      )}
                    >
                      {primaryAction.label}
                      <PlaneTakeoffIcon aria-hidden="true" className="size-4" />
                    </NativeControl>
                  ) : null}
                  {secondaryAction ? (
                    <NativeControl
                      action={secondaryAction}
                      className={cn(
                        "jk-hero33-cta flex h-12 items-center rounded-md border px-8 text-sm font-medium",
                        amberStroke,
                        overlayText,
                        glassHover,
                        "transition-transform active:scale-[0.96] motion-reduce:active:scale-100",
                        focusRing,
                      )}
                      style={{ animationDelay: "0.95s" }}
                    >
                      {secondaryAction.label}
                    </NativeControl>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {features.length ? (
            <div className="mt-12 flex flex-col gap-8 md:flex-row md:gap-16">
              {features.map((feature, index) => {
                const Icon = featureIcons[feature.icon];
                return (
                  <div
                    key={`${feature.title}-${index}`}
                    className="jk-hero33-feature flex items-center gap-4"
                    style={{ animationDelay: `${1.1 + index * 0.12}s` }}
                  >
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-sm",
                        amberStroke,
                        glassFill,
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn("size-6", overlayText)}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "text-base font-semibold",
                          overlayText,
                        )}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-1 text-sm leading-relaxed whitespace-pre-line",
                          overlayMuted,
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
