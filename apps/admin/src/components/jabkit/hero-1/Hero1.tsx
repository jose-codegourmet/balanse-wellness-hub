"use client";

import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { Hero1Action, Hero1NavItem, Hero1Props } from "./Hero1.types";

const defaultNavItems: Hero1NavItem[] = [
  { label: "Products", href: "#products", active: true },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Support", href: "#support" },
];

const defaultSignIn: Hero1Action = { label: "Sign in", href: "#signin" };
const defaultCta: Hero1Action = {
  label: "Let's Move Forward Today",
  href: "#forward",
};

const defaultSocialLinks = [
  { label: "Linkedin", href: "#linkedin" },
  { label: "Instagram", href: "#instagram" },
  { label: "Behance", href: "#behance" },
];

const defaults = {
  brand: "Aurevia",
  brandHref: "#home",
  titleLead: "The goal's the focus,",
  titleTrail: "time's the marker.",
  description:
    "Advanced wind turbines that take energy\n production to new heights.",
  scrollLabel: "Scroll to Discover",
  backgroundImage: "/assets/ceb500f4f6db225a.webp",
  backgroundAlt: "Purple lattice structure rising from the lower left",
} as const;

const plate =
  "bg-[color-mix(in_oklab,var(--jk-foreground),var(--jk-background)_6%)] dark:bg-[color-mix(in_oklab,var(--jk-background),var(--jk-foreground)_4%)]";
const ink = "text-background dark:text-foreground";
const inkSoft = "text-background/60 dark:text-foreground/60";
const lightFill = "bg-background dark:bg-foreground";
const lightInk = "text-foreground dark:text-background";
const darkFill = "bg-foreground dark:bg-background";
const darkInk = "text-background dark:text-foreground";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function ActionControl({
  action,
  className,
  children,
}: {
  action: Hero1Action;
  className: string;
  children: ReactNode;
}) {
  if (action.href) {
    return (
      <a href={action.href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={action.onClick}>
      {children}
    </button>
  );
}

export function Hero1({
  className,
  brand = defaults.brand,
  brandHref = defaults.brandHref,
  navItems = defaultNavItems,
  signIn = defaultSignIn,
  titleLead = defaults.titleLead,
  titleTrail = defaults.titleTrail,
  description = defaults.description,
  cta = defaultCta,
  socialLinks = defaultSocialLinks,
  scrollLabel = defaults.scrollLabel,
  backgroundImage = defaults.backgroundImage,
  backgroundAlt = defaults.backgroundAlt,
  ...props
}: Hero1Props) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState(navItems);

  return (
    <section
      data-slot="hero-1"
      className={cn(
        "relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden font-sans antialiased",
        plate,
        ink,
        "selection:bg-background selection:text-foreground dark:selection:bg-foreground dark:selection:text-background",
        className,
      )}
      {...props}
    >
      <style href="jk-hero-1" precedence="default">{`
        @keyframes jk-hero1-nav {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes jk-hero1-bg {
          from { opacity: 0; transform: scale(1.05); }
          to { opacity: 0.9; transform: scale(1); }
        }
        @keyframes jk-hero1-item {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes jk-hero1-scroll {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .jk-hero1-bg {
          animation: jk-hero1-bg 1.2s ease-out both;
        }
        .jk-hero1-nav {
          animation: jk-hero1-nav 0.6s ease-out both;
        }
        .jk-hero1-item {
          animation: jk-hero1-item 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .jk-hero1-scroll {
          animation: jk-hero1-scroll 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .jk-hero1-bg,
          .jk-hero1-nav,
          .jk-hero1-item,
          .jk-hero1-scroll {
            animation: none;
          }
        }
      `}</style>

      <div className="jk-hero1-bg pointer-events-none absolute bottom-0 left-0 z-0 h-[80%] w-full overflow-hidden select-none sm:w-[85%] md:h-[75%] md:w-[65%]">
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left-bottom opacity-90"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_80%,transparent_40%,color-mix(in_oklab,var(--jk-foreground),var(--jk-background)_6%)_85%)] dark:bg-[radial-gradient(ellipse_80%_70%_at_20%_80%,transparent_40%,color-mix(in_oklab,var(--jk-background),var(--jk-foreground)_4%)_85%)]"
        />
      </div>
      <p className="sr-only">{backgroundAlt}</p>

      <header className="jk-hero1-nav relative z-50 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20">
        <a
          href={brandHref}
          className={cn(
            "relative text-lg font-semibold tracking-tight",
            ink,
            focusRing,
          )}
        >
          {brand}
          <span aria-hidden="true" className="absolute -top-1 -right-2 text-xs">
            •
          </span>
        </a>

        {links.length ? (
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-12 lg:gap-16">
              {links.map((link) => (
                <li
                  key={`${link.href}-${link.label}`}
                  className="relative py-1"
                >
                  <a
                    href={link.href}
                    onClick={() =>
                      setLinks(
                        links.map((item) => ({
                          ...item,
                          active: item.label === link.label,
                        })),
                      )
                    }
                    className={cn(
                      "relative px-0.5 text-base font-medium tracking-wide transition-colors duration-300",
                      link.active ? ink : inkSoft,
                      "hover:text-background dark:hover:text-foreground",
                      focusRing,
                    )}
                  >
                    {link.label}
                    {link.active ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-0 bottom-[-4px] left-0 h-[1.5px] bg-background dark:bg-foreground"
                      />
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {signIn ? (
          <div className="ml-4 hidden md:block">
            <ActionControl
              action={signIn}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border border-background bg-transparent px-6 py-2.5 text-base font-medium",
                "dark:border-foreground",
                ink,
                "transition-colors duration-300 hover:border-background/50 hover:bg-background/5 dark:hover:border-foreground/50 dark:hover:bg-foreground/5",
                focusRing,
              )}
            >
              {signIn.label}
            </ActionControl>
          </div>
        ) : null}

        <button
          type="button"
          className={cn(
            "relative z-50 flex size-9 items-center justify-center rounded-full border border-background/15 bg-background/5 md:hidden",
            "dark:border-foreground/15 dark:bg-foreground/5",
            "hover:bg-background/10 dark:hover:bg-foreground/10",
            focusRing,
          )}
          aria-expanded={open}
          aria-controls="hero-1-menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="relative h-4 w-4">
            <span
              className={cn(
                "absolute left-0 h-[1.5px] w-full bg-background transition-transform duration-300 dark:bg-foreground",
                open ? "top-[7px] rotate-45" : "top-[2px]",
              )}
            />
            <span
              className={cn(
                "absolute top-[7px] left-0 h-[1.5px] w-full bg-background transition-opacity duration-300 dark:bg-foreground",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-[1.5px] w-full bg-background transition-transform duration-300 dark:bg-foreground",
                open ? "top-[7px] -rotate-45" : "top-[12px]",
              )}
            />
          </span>
        </button>
      </header>

      {open ? (
        <div
          id="hero-1-menu"
          className={cn(
            "fixed inset-0 z-40 flex flex-col justify-between px-6 py-24 backdrop-blur-md md:hidden",
            "bg-[color-mix(in_oklab,var(--jk-foreground),transparent_2%)] dark:bg-[color-mix(in_oklab,var(--jk-background),transparent_2%)]",
          )}
        >
          <nav aria-label="Mobile" className="mt-8 flex flex-col gap-6">
            {links.map((link) => (
              <a
                key={`${link.href}-${link.label}-mobile`}
                href={link.href}
                onClick={() => {
                  setLinks(
                    links.map((item) => ({
                      ...item,
                      active: item.label === link.label,
                    })),
                  );
                  setOpen(false);
                }}
                className={cn(
                  "block text-3xl font-semibold",
                  link.active
                    ? ink
                    : "text-background/50 dark:text-foreground/50",
                  focusRing,
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
          {signIn ? (
            <ActionControl
              action={signIn}
              className={cn(
                "w-full rounded-full border border-background/20 bg-background/5 py-3.5 text-center text-base font-medium",
                "dark:border-foreground/20 dark:bg-foreground/5",
                ink,
                "hover:bg-background/10 dark:hover:bg-foreground/10",
                focusRing,
              )}
            >
              {signIn.label}
            </ActionControl>
          ) : null}
        </div>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pt-12 pb-10 md:px-12 md:pt-16 md:pb-12 lg:px-20">
        <div className="mt-[5vh] flex max-w-[850px] flex-col gap-8 md:gap-10">
          <h1
            className={cn(
              "jk-hero1-item text-5xl leading-[1.08] font-medium tracking-[-0.04em] md:text-6xl lg:text-7xl",
              ink,
            )}
          >
            <span className="block">{titleLead}</span>
            {titleTrail ? <span className="block">{titleTrail}</span> : null}
          </h1>

          {cta ? (
            <div
              className="jk-hero1-item w-fit"
              style={{ animationDelay: "0.12s" }}
            >
              <ActionControl
                action={cta}
                className={cn(
                  "group inline-flex w-fit items-center gap-4 rounded-lg p-1 pr-1 pl-4 text-sm font-medium",
                  lightFill,
                  lightInk,
                  "shadow-[0_4px_16px_color-mix(in_oklab,var(--jk-background),transparent_94%)]",
                  "transition-opacity duration-300 hover:opacity-90",
                  focusRing,
                )}
              >
                <span>{cta.label}</span>
                <span
                  className={cn(
                    "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md",
                    darkFill,
                    darkInk,
                  )}
                >
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                  />
                </span>
              </ActionControl>
            </div>
          ) : null}
        </div>

        <div
          className="jk-hero1-item relative mt-auto flex w-full flex-col justify-between gap-12 pt-16 lg:flex-row lg:items-end lg:gap-10"
          style={{ animationDelay: "0.24s" }}
        >
          {description ? (
            <p className="whitespace-pre-line text-base leading-relaxed font-normal md:max-w-3xl md:text-lg lg:text-xl">
              {description}
            </p>
          ) : null}

          <div className="flex w-full flex-col justify-between gap-10 pb-1 md:flex-row md:items-end lg:w-auto lg:justify-end">
            {socialLinks.length ? (
              <div className="order-1 flex items-center gap-6 lg:order-2 lg:gap-12">
                {socialLinks.map((social) => (
                  <a
                    key={`${social.href}-${social.label}`}
                    href={social.href}
                    className={cn(
                      "text-base tracking-wide transition-opacity duration-200 hover:opacity-80 lg:text-lg",
                      focusRing,
                    )}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            ) : null}

            {scrollLabel ? (
              <div className="order-2 hidden items-center gap-3 text-sm tracking-wide md:flex lg:absolute lg:bottom-1 lg:left-1/2 lg:order-1 lg:-translate-x-1/2 lg:text-base">
                <span>{scrollLabel}</span>
                <span className="jk-hero1-scroll inline-flex">
                  <ArrowDownIcon
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={1.5}
                  />
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
