"use client";

import {
  ADMIN_NAV_ITEMS,
  type AdminNavItem,
  CUSTOMER_NAV_ITEMS,
  type CustomerNavItem,
  isAdminNavActive,
  isCustomerNavActive,
  isPublicNavActive,
  PUBLIC_NAV_ITEMS,
  type PublicNavItem,
  publicAuthItem,
} from "@balanse/domain";
import { useEffect, useId, useState } from "react";
import { BrandLockup } from "../../brand/BrandLockup";
import { Button, buttonVariants } from "../../components/button/Button";
import { cn } from "../../lib/utils";
import { DefaultNavLink, type NavLinkComponent } from "./nav-link";

const DefaultLink = DefaultNavLink;

function navClass(active: boolean, extra?: string) {
  return cn(
    "rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active ? "bg-secondary font-semibold" : "text-foreground hover:bg-muted",
    extra,
  );
}

/** Desktop item: gold rule slides under the active destination. */
function publicItemClass(active: boolean) {
  return cn(
    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent after:transition-transform after:duration-200 after:content-['']",
    active
      ? "text-foreground after:scale-x-100"
      : "text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100",
  );
}

export function PublicNav({
  pathname,
  hash = "",
  principalRole = "guest",
  link: Link = DefaultLink,
  brandHref = "/",
  ctaHref = "/#schedule",
  ctaLabel = "Reserve a spot",
  skipToId = "main-content",
  mobileCtaVisible = true,
  mobileCtaOnly = false,
}: {
  pathname: string;
  hash?: string;
  principalRole?: "guest" | "customer" | "admin";
  link?: NavLinkComponent;
  brandHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  skipToId?: string;
  /** Visibility is controlled by the host booking-area observer. */
  mobileCtaVisible?: boolean;
  mobileCtaOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const items = PUBLIC_NAV_ITEMS.map((item) =>
    item.id === "auth" ? publicAuthItem(principalRole) : item,
  ) as PublicNavItem[];
  const browseItems = items.filter((item) => item.id !== "auth");
  const authItem = items.find((item) => item.id === "auth") as PublicNavItem;
  const authActive = isPublicNavActive(authItem, pathname, hash);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the panel when the route changes; otherwise it survives an in-app
  // navigation. Adjusting during render avoids a second paint with a stale menu.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <header
      data-section="header"
      data-menu-open={open}
      className="sticky top-0 z-50 border-b border-[var(--balanse-tan)]/45 bg-background/95 backdrop-blur-md"
    >
      <a
        href={`#${skipToId}`}
        className={cn(
          buttonVariants({ size: "sm" }),
          // `not-focus:` (not plain `sr-only`) so the visually-hidden rules win
          // over the button's own position, size and padding until focused.
          "not-focus:sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50",
        )}
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-4 px-5 md:px-8">
        <Link
          href={brandHref}
          className="rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="sr-only">Balansé Wellness Hub home</span>
          <BrandLockup className="[&>span:last-child]:text-muted-foreground" />
        </Link>

        <nav aria-label="Public" className="ml-auto hidden items-center gap-1 lg:flex">
          {browseItems.map((item) => {
            const active = isPublicNavActive(item, pathname, hash);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={publicItemClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href={authItem.href}
            className={cn(
              buttonVariants({ variant: authActive ? "secondary" : "outline" }),
              "hidden lg:inline-flex",
            )}
            aria-current={authActive ? "page" : undefined}
          >
            {authItem.label}
          </Link>
          <Link
            href={ctaHref}
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants(),
              mobileCtaVisible ? "inline-flex" : "hidden",
              mobileCtaOnly ? "lg:hidden" : "lg:inline-flex",
            )}
          >
            {ctaLabel}
          </Link>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuGlyph open={open} />
          </Button>
        </div>
      </div>

      <div
        id={navId}
        hidden={!open}
        className="border-t border-[var(--balanse-tan)]/45 bg-background lg:hidden"
      >
        <nav aria-label="Public (compact)" className="mx-auto max-w-7xl px-4 py-3">
          <ul className="flex flex-col">
            {browseItems.map((item) => {
              const active = isPublicNavActive(item, pathname, hash);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between border-b border-border/60 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-accent"
                        data-active-dot
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-col gap-2 pb-2">
            <Link
              href={authItem.href}
              onClick={() => setOpen(false)}
              aria-current={authActive ? "page" : undefined}
              className={buttonVariants({
                variant: authActive ? "secondary" : "outline",
                size: "lg",
              })}
            >
              {authItem.label}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function CustomerNav({
  pathname,
  link: Link = DefaultLink,
}: {
  pathname: string;
  link?: NavLinkComponent;
}) {
  return (
    <nav
      aria-label="Customer portal"
      className="flex flex-wrap gap-2 border-b border-border bg-card px-4 py-3"
    >
      {CUSTOMER_NAV_ITEMS.map((item: CustomerNavItem) => {
        const active = isCustomerNavActive(item, pathname);
        return (
          <Link key={item.id} href={item.href} className={navClass(active)}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav({
  pathname,
  link: Link = DefaultLink,
}: {
  pathname: string;
  link?: NavLinkComponent;
}) {
  const [open, setOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside className="w-full shrink-0 border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:w-64 md:border-b-0 md:border-r">
      {/* `dark` flips the tokens for this row so Button variants read on navy. */}
      <div className="dark flex items-center justify-between p-4">
        <BrandLockup tone="inverse" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="md:hidden"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </Button>
      </div>
      <nav
        id={navId}
        aria-label="Admin"
        className={cn("flex-col gap-1 px-2 pb-3 md:flex", open ? "flex" : "hidden md:flex")}
      >
        {ADMIN_NAV_ITEMS.map((item: AdminNavItem) => {
          const active = isAdminNavActive(item, pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active ? "bg-sidebar-accent font-semibold" : "hover:bg-sidebar-accent/50",
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
