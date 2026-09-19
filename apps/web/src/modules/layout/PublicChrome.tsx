"use client";

import { BrandLockup } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export const PUBLIC_NAV = [
  { href: "/#schedule", label: "Schedule", match: "/" },
  { href: "/#classes", label: "Classes", match: "/" },
  { href: "/coaches", label: "Coaches", match: "/coaches" },
  { href: "/about", label: "About", match: "/about" },
  { href: "/faqs", label: "FAQs", match: "/faqs" },
  { href: "/contact", label: "Contact", match: "/contact" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();
  const { principal } = useMockPrincipal();
  const [open, setOpen] = useState(false);
  const authHref = principal.role === "guest" ? "/login" : "/portal/profile";
  const authLabel = principal.role === "guest" ? "Login" : "Profile";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Balansé Wellness Hub home">
          <BrandLockup />
        </Link>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="public-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <nav
          id="public-nav"
          className={cn(
            "absolute left-0 right-0 top-16 z-40 flex-col gap-1 border-b border-border bg-card px-4 py-3 md:static md:flex md:flex-row md:items-center md:gap-4 md:border-0 md:p-0",
            open ? "flex" : "hidden md:flex",
          )}
        >
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "rounded-md px-2 py-2 text-sm",
                pathname === item.match ? "bg-secondary font-semibold" : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={authHref}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            {authLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground">
        <BrandLockup />
        <p>Cebu City · Placeholder marketing imagery will land in the assets track.</p>
      </div>
    </footer>
  );
}
