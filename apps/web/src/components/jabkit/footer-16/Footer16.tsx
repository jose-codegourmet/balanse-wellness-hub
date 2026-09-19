"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  Footer16LinkColumn,
  Footer16Props,
  Footer16SocialKind,
  Footer16SocialLink,
} from "./Footer16.types";

const defaultLinkColumns: Footer16LinkColumn[] = [
  {
    title: "Solutions",
    links: [
      { label: "Demand pipelines", href: "#demand" },
      { label: "Search presence", href: "#search" },
      { label: "Conversion paths", href: "#conversion" },
      { label: "Lifecycle loops", href: "#lifecycle" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { label: "Site systems", href: "#sites" },
      { label: "Brand kits", href: "#brand" },
      { label: "Growth studios", href: "#growth" },
      { label: "Commerce rails", href: "#commerce" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Field notes", href: "#notes" },
      { label: "Briefings", href: "#briefings" },
      { label: "Playbooks", href: "#playbooks" },
      { label: "Reports", href: "#reports" },
    ],
  },
];

const defaultSocialLinks: Footer16SocialLink[] = [
  { label: "Facebook", href: "#facebook", kind: "facebook" },
  { label: "X", href: "#x", kind: "x" },
  { label: "Instagram", href: "#instagram", kind: "instagram" },
  { label: "LinkedIn", href: "#linkedin", kind: "linkedin" },
];

const defaultLegalLinks = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
  { label: "Cookie Policy", href: "#cookies" },
];

const defaults = {
  brandName: "MERID",
  brandHref: "#home",
  tagline:
    "Change the next quarter with demand\nand growth systems. Everything you need\nstarts here.",
  copyright: "© 2026 Merid. All rights reserved.",
  backgroundImage: "/assets/bf4e978c5bd9765e.webp",
} as const;

const plate =
  "bg-[color-mix(in_oklab,var(--jk-foreground),var(--jk-background)_8%)] dark:bg-[color-mix(in_oklab,var(--jk-background),var(--jk-foreground)_4%)]";
const ink = "text-background dark:text-foreground";
const inkSoft = "text-background/70 dark:text-foreground/70";
const inkMute = "text-background/55 dark:text-foreground/55";
const inkLegal = "text-background/80 dark:text-foreground/80";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function DefaultBrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
    >
      <rect x="3" y="3" width="26" height="26" rx="8" />
      <path d="M11 8h5v16h-5z" opacity="0.35" />
    </svg>
  );
}

function SocialGlyph({ kind }: { kind: Footer16SocialKind }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-[1em]",
    fill: "currentColor",
    "aria-hidden": true as const,
    focusable: false as const,
  };

  if (kind === "facebook") {
    return (
      <svg {...common}>
        <title>Facebook</title>
        <path d="M14.5 9H17V6h-2.5C12 6 11 7.3 11 9.2V11H9v3h2v7h3v-7h2.4l.6-3H14v-1.3c0-.5.2-.7.5-.7Z" />
      </svg>
    );
  }
  if (kind === "x") {
    return (
      <svg {...common}>
        <title>X</title>
        <path d="M14.7 10.4 21.2 3h-1.5l-5.7 6.4L9.5 3H3.2l6.9 10.1L3.2 21h1.5l6-6.8 4.8 6.8h6.3L14.7 10.4Zm-2.1 2.4-.7-1-5.6-7.8h2.4l4.5 6.3.7 1 5.9 8.2h-2.4l-4.8-6.7Z" />
      </svg>
    );
  }
  if (kind === "instagram") {
    return (
      <svg {...common}>
        <title>Instagram</title>
        <path d="M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8A4.5 4.5 0 0 1 16 20.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Zm0 1.6A2.9 2.9 0 0 0 5.1 8v8A2.9 2.9 0 0 0 8 18.9h8A2.9 2.9 0 0 0 18.9 16V8A2.9 2.9 0 0 0 16 5.1H8Zm8.4 1.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <title>LinkedIn</title>
      <path d="M6.3 9.2H3.6V20h2.7V9.2ZM4.95 4A1.55 1.55 0 1 0 5 7.1 1.55 1.55 0 0 0 4.95 4ZM20.4 20h-2.68v-5.5c0-1.55-.53-2.6-1.86-2.6-1.01 0-1.62.68-1.88 1.34-.1.24-.12.57-.12.9V20H11.2s.04-9.7 0-10.8h2.67v1.53c.36-.55 1-1.33 2.43-1.33 1.77 0 3.1 1.16 3.1 3.65V20Z" />
    </svg>
  );
}

function useOnceInView<T extends HTMLElement>(threshold = 0.22) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function Footer16({
  className,
  brandName = defaults.brandName,
  brandHref = defaults.brandHref,
  brandLogo,
  tagline = defaults.tagline,
  linkColumns = defaultLinkColumns,
  legalLinks = defaultLegalLinks,
  socialLinks = defaultSocialLinks,
  copyright = defaults.copyright,
  backgroundImage = defaults.backgroundImage,
  ...props
}: Footer16Props) {
  const markGradientId = useId().replace(/:/g, "");
  const wordmarkWidth = Math.max(brandName.length * 90, 400);
  const { ref, inView } = useOnceInView<HTMLElement>(0.22);

  return (
    <footer
      ref={ref}
      data-slot="footer-16"
      className={cn(
        "jk-footer16 relative w-full overflow-hidden font-sans antialiased",
        plate,
        ink,
        inView && "jk-footer16-in",
        className,
      )}
      {...props}
    >
      <style href="jk-footer-16" precedence="default">{`
        .jk-footer16-veil {
          background-image: linear-gradient(
            180deg,
            color-mix(in oklab, var(--jk-foreground) 35%, transparent) 0%,
            color-mix(in oklab, var(--jk-foreground) 6%, transparent) 42%,
            color-mix(in oklab, var(--jk-foreground) 58%, transparent) 68%,
            color-mix(in oklab, var(--jk-foreground) 90%, transparent) 100%
          );
        }
        .dark .jk-footer16-veil {
          background-image: linear-gradient(
            180deg,
            color-mix(in oklab, var(--jk-background) 35%, transparent) 0%,
            color-mix(in oklab, var(--jk-background) 6%, transparent) 42%,
            color-mix(in oklab, var(--jk-background) 58%, transparent) 68%,
            color-mix(in oklab, var(--jk-background) 90%, transparent) 100%
          );
        }
        .jk-footer16-panel {
          background-color: color-mix(in oklab, var(--jk-foreground) 1%, transparent);
          box-shadow: 0 -24px 80px
            color-mix(in oklab, var(--jk-foreground) 34%, transparent);
        }
        .dark .jk-footer16-panel {
          background-color: color-mix(in oklab, var(--jk-background) 8%, transparent);
          box-shadow: 0 -24px 80px
            color-mix(in oklab, var(--jk-background) 34%, transparent);
        }
        .jk-footer16-word {
          opacity: 0;
          transform: translateY(30px);
          filter: blur(10px);
        }
        .jk-footer16-rise {
          opacity: 0;
          transform: translateY(16px);
          filter: blur(6px);
        }
        .jk-footer16-link {
          opacity: 0;
          transform: translateY(7px);
        }
        .jk-footer16-in .jk-footer16-word {
          animation: jk-footer16-word 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .jk-footer16-in .jk-footer16-rise {
          animation: jk-footer16-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--jk-footer16-delay, 80ms);
        }
        .jk-footer16-in .jk-footer16-link {
          animation: jk-footer16-link 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--jk-footer16-delay, 0ms);
        }
        @keyframes jk-footer16-word {
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes jk-footer16-rise {
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes jk-footer16-link {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .jk-footer16-word,
          .jk-footer16-rise,
          .jk-footer16-link,
          .jk-footer16-in .jk-footer16-word,
          .jk-footer16-in .jk-footer16-rise,
          .jk-footer16-in .jk-footer16-link {
            opacity: 1;
            transform: none;
            filter: none;
            animation: none;
          }
        }
      `}</style>

      <div
        className="absolute inset-0 z-10 bg-cover bg-center sm:-translate-y-16"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <div className="jk-footer16-veil absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[620px] flex-col justify-end pt-16 sm:min-h-[680px] lg:min-h-[812px]">
        <div
          className="jk-footer16-word pointer-events-none absolute top-[43%] left-1/2 flex w-[118vw] -translate-x-1/2 justify-center overflow-hidden sm:top-[20%] lg:top-[12%]"
          aria-hidden="true"
        >
          <svg
            className="h-auto w-full select-none"
            viewBox={`0 0 ${wordmarkWidth} 160`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={markGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="color-mix(in oklab, var(--jk-muted-foreground) 72%, var(--jk-foreground))"
                />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--jk-foreground) 86%, var(--jk-background))"
                />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="50%"
              dominantBaseline="alphabetic"
              textAnchor="middle"
              textLength="80%"
              lengthAdjust="spacing"
              className="font-sans font-medium tracking-tight"
              fill={`url(#${markGradientId})`}
              fontSize="100"
            >
              {brandName}
            </text>
          </svg>
        </div>

        <div className="jk-footer16-panel relative z-10 border-t border-background/10 px-4 pt-9 pb-7 backdrop-blur-[2px] sm:px-12 sm:pt-11 sm:pb-8 lg:pt-[46px] dark:border-foreground/10">
          <div className="grid gap-10 lg:grid-cols-[minmax(220px,1fr)_minmax(520px,0.98fr)] lg:gap-x-20">
            <div
              className="jk-footer16-rise max-w-2xl"
              style={{ "--jk-footer16-delay": "80ms" } as CSSProperties}
            >
              <a
                href={brandHref}
                className={cn(
                  "group inline-flex min-h-10 items-start gap-2 rounded-none",
                  ink,
                  "transition-[opacity,transform] duration-200 ease-out hover:opacity-85 active:scale-[0.96]",
                  "motion-reduce:transition-none motion-reduce:active:scale-100",
                  focusRing,
                )}
                aria-label={`${brandName} home`}
              >
                <span className="shrink-0 -translate-y-2">
                  {brandLogo ?? <DefaultBrandMark className="size-8" />}
                </span>
                <span className="text-xl leading-none font-normal tracking-wide">
                  {brandName}
                </span>
              </a>
              <p
                className={cn(
                  "mt-1 max-w-lg text-sm leading-relaxed font-normal text-pretty whitespace-pre-line",
                  inkSoft,
                )}
              >
                {tagline}
              </p>
            </div>

            <nav
              aria-label="Footer navigation"
              className="grid grid-cols-1 gap-7 min-[520px]:grid-cols-3 min-[520px]:gap-x-10 lg:gap-x-[66px]"
            >
              {linkColumns.map((column, columnIndex) => (
                <div
                  key={column.title}
                  className="jk-footer16-rise"
                  style={
                    {
                      "--jk-footer16-delay": `${160 + columnIndex * 80}ms`,
                    } as CSSProperties
                  }
                >
                  <h3 className="text-base leading-none font-light tracking-wide uppercase">
                    {column.title}
                  </h3>
                  <ul className="mt-4 flex list-none flex-col space-y-2 p-0">
                    {column.links.map((link, linkIndex) => (
                      <li
                        key={`${column.title}-${link.label}`}
                        className="jk-footer16-link"
                        style={
                          {
                            "--jk-footer16-delay": `${240 + columnIndex * 80 + linkIndex * 45}ms`,
                          } as CSSProperties
                        }
                      >
                        <a
                          href={link.href}
                          className={cn(
                            "inline-flex min-h-5 items-center rounded-none text-sm leading-tight font-light",
                            inkMute,
                            "transition-colors duration-200 ease-out hover:text-background dark:hover:text-foreground",
                            focusRing,
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div
            className="jk-footer16-rise mt-4 flex flex-col gap-2 border-t border-background/10 pt-4 sm:mt-9 sm:flex-row sm:items-start sm:justify-between dark:border-foreground/10"
            style={{ "--jk-footer16-delay": "420ms" } as CSSProperties}
          >
            <p className={cn("text-sm font-normal", inkMute)}>{copyright}</p>

            <div className="flex flex-col sm:items-end">
              <ul
                className="flex items-center gap-1 sm:justify-end"
                aria-label="Social links"
              >
                {socialLinks.map((link, index) => (
                  <li
                    key={link.label}
                    className="jk-footer16-link"
                    style={
                      {
                        "--jk-footer16-delay": `${460 + index * 45}ms`,
                      } as CSSProperties
                    }
                  >
                    <a
                      href={link.href}
                      aria-label={link.label}
                      className={cn(
                        "group relative flex size-10 items-center justify-start rounded-none",
                        inkMute,
                        "transition-[color,transform] duration-200 ease-out hover:text-background active:scale-[0.96] dark:hover:text-foreground",
                        "motion-reduce:transition-none motion-reduce:active:scale-100",
                        focusRing,
                      )}
                    >
                      <span className="text-base transition-[opacity,scale,filter] duration-200 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100">
                        {link.icon ??
                          (link.kind ? (
                            <SocialGlyph kind={link.kind} />
                          ) : (
                            link.label
                          ))}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <ul className="flex flex-wrap items-center gap-x-5 sm:justify-end">
                {legalLinks.map((link, index) => (
                  <li
                    key={link.label}
                    className="jk-footer16-link"
                    style={
                      {
                        "--jk-footer16-delay": `${520 + index * 45}ms`,
                      } as CSSProperties
                    }
                  >
                    <a
                      href={link.href}
                      className={cn(
                        "inline-flex min-h-5 items-center rounded-none text-sm leading-none font-normal",
                        inkLegal,
                        "transition-colors duration-200 ease-out hover:text-background dark:hover:text-foreground",
                        focusRing,
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
