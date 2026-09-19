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
import { cn } from "../../lib/utils";

export type NavLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export type NavLinkComponent = (props: NavLinkProps) => React.ReactNode;

const DefaultLink: NavLinkComponent = ({ href, className, children, onClick }) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

function navClass(active: boolean, extra?: string) {
  return cn(
    "rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active ? "bg-secondary font-semibold" : "text-foreground hover:bg-muted",
    extra,
  );
}

export function PublicNav({
  pathname,
  hash = "",
  principalRole = "guest",
  link: Link = DefaultLink,
  brandHref = "/",
}: {
  pathname: string;
  hash?: string;
  principalRole?: "guest" | "customer" | "admin";
  link?: NavLinkComponent;
  brandHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const items = PUBLIC_NAV_ITEMS.map((item) =>
    item.id === "auth" ? publicAuthItem(principalRole) : item,
  ) as PublicNavItem[];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header data-section="header" className="relative border-b border-border bg-card">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={brandHref} className="rounded-md focus-visible:ring-2 focus-visible:ring-ring">
          <span className="sr-only">Balansé Wellness Hub home</span>
          <BrandLockup />
        </Link>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        <nav
          id={navId}
          aria-label="Public"
          className={cn(
            "absolute left-0 right-0 top-16 z-40 flex-col gap-1 border-b border-border bg-card px-4 py-3 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:p-0",
            open ? "flex" : "hidden md:flex",
          )}
        >
          {items.map((item) => {
            const active = isPublicNavActive(item, pathname, hash);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={navClass(
                  active,
                  item.id === "auth"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : undefined,
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
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
      <div className="flex items-center justify-between p-4">
        <BrandLockup tone="inverse" />
        <button
          type="button"
          className="rounded-md border border-sidebar-border px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
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
