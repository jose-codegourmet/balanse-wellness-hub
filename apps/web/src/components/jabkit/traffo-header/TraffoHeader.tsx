"use client";

import { ArrowRight, Hexagon, Menu, X } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { TraffoHeaderProps } from "./TraffoHeader.types";

const defaults = {
  brand: "Traffo",
  brandHref: "#top",
  links: [
    { label: "Analytics", href: "#graph" },
    { label: "Features", href: "#features", hasMenu: true },
    { label: "Blog", href: "#blog" },
    { label: "Get in touch", href: "#contact" },
  ],
  ctaLabel: "Start for free",
  ctaHref: "#start",
  menuLabel: "Toggle menu",
} as const;

export function TraffoHeader({
  className,
  brand = defaults.brand,
  brandHref = defaults.brandHref,
  links = [...defaults.links],
  ctaLabel = defaults.ctaLabel,
  ctaHref = defaults.ctaHref,
  menuLabel = defaults.menuLabel,
  ...props
}: TraffoHeaderProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  return (
    <header
      data-slot="traffo-header"
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[80rem] items-center justify-between gap-4 px-[var(--jk-space-gutter)]"
      >
        <a
          href={brandHref}
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground no-underline"
        >
          <Hexagon aria-hidden="true" className="size-5" strokeWidth={1.75} />
          {brand}
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex items-center gap-1 text-sm text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground motion-reduce:transition-none"
              >
                {link.label}
                {link.hasMenu ? (
                  <span aria-hidden="true" className="text-[10px]">
                    ▾
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={ctaHref}
            className="hidden h-10 items-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-medium text-primary-foreground no-underline transition-[transform,filter] duration-200 hover:brightness-110 active:translate-y-px motion-reduce:transition-none sm:inline-flex"
          >
            {ctaLabel}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-[8px] text-foreground md:hidden"
            aria-label={menuLabel}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </nav>
      {open ? (
        <div
          id={menuId}
          className="border-t border-border px-[var(--jk-space-gutter)] py-4 md:hidden"
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-foreground no-underline"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={ctaHref}
                className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-medium text-primary-foreground no-underline"
                onClick={() => setOpen(false)}
              >
                {ctaLabel}
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
