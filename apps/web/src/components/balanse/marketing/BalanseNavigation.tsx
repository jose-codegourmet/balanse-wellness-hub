"use client";

import {
  CONTACT_DETAILS,
  isPublicNavActive,
  PUBLIC_NAV_ITEMS,
  publicAuthItem,
} from "@balanse/domain";
import { BrandLockup, MarketingImage } from "@balanse/ui";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/jabkit/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/jabkit/dialog";
import { cn } from "@/lib/utils";

/** Jabkit modal supplies focus trapping, Escape dismissal, and scroll locking. */
export function BalanseNavigation({
  pathname,
  hash,
  principalRole,
  bookingVisible,
}: {
  pathname: string;
  hash: string;
  principalRole: "guest" | "customer" | "admin";
  bookingVisible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }
  const auth = publicAuthItem(principalRole);
  const items = PUBLIC_NAV_ITEMS.filter((item) => item.id !== "auth");
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <header
        data-section="header"
        data-menu-open={open}
        className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
      >
        <a
          href="#main-content"
          className="sr-only rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-50"
        >
          Skip to content
        </a>
        <div className="marketing-container flex h-20 items-center justify-between gap-4">
          <Link href="/" className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
            <BrandLockup className="[&>span:last-child]:text-muted-foreground" />
            <span className="sr-only"> home</span>
          </Link>
          <div className="flex items-center gap-3">
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  className="group gap-3 rounded-full border border-border px-4 hover:bg-secondary/50"
                  aria-label="Open menu"
                >
                  <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] sm:inline">
                    Menu
                  </span>
                  <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </Button>
              }
            />
          </div>
        </div>
      </header>
      {!bookingVisible ? (
        <div className="balanse-mobile-booking-bar" data-mobile-booking>
          <Button asChild className="balanse-mobile-booking-button">
            <Link href="/#schedule">
              Book a class <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : null}
      <DialogContent
        showCloseButton={false}
        className="balanse-full-menu translate-x-0 translate-y-0"
        aria-describedby="full-menu-description"
      >
        <DialogTitle className="sr-only">Balansé menu</DialogTitle>
        <DialogDescription id="full-menu-description" className="sr-only">
          Explore classes, meet the coaches, or visit your account.
        </DialogDescription>
        <div className="border-b border-border">
          <div className="marketing-container flex h-20 items-center justify-between gap-4">
            <Link
              href="/"
              onClick={close}
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            >
              <BrandLockup className="[&>span:last-child]:text-muted-foreground" />
              <span className="sr-only"> home</span>
            </Link>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  className="gap-3 rounded-full border border-border px-4 hover:bg-secondary/50"
                  aria-label="Close menu"
                >
                  <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] sm:inline">
                    Close
                  </span>
                  <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </Button>
              }
            />
          </div>
        </div>
        <div className="marketing-container grid flex-1 content-center gap-10 py-8 md:grid-cols-[1.2fr_1fr] md:gap-20 md:py-12">
          <nav aria-label="Full menu">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isPublicNavActive(item, pathname, hash);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex min-h-14 items-center justify-between gap-4 rounded-sm py-1 font-display text-3xl font-normal tracking-[-0.035em] transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring md:min-h-16 lg:text-5xl",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight
                        strokeWidth={1.25}
                        className={cn(
                          "size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                          active ? "opacity-100" : "opacity-30",
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-border pt-6">
              <Button asChild className="rounded-full px-7">
                <Link href={auth.href} onClick={close}>
                  {auth.label}
                  <ArrowUpRight className="ml-4 size-4" aria-hidden="true" />
                </Link>
              </Button>
              {principalRole === "guest" ? (
                <Link href="/sign-up" onClick={close} className="marketing-text-link">
                  Create an account
                </Link>
              ) : null}
            </div>
          </nav>
          <div className="hidden md:flex md:flex-col md:justify-center">
            <MarketingImage assetId="landing-a" decorative className="!rounded-sm" />
            <p className="mt-7 font-display text-2xl leading-snug lg:text-3xl">
              A little movement.
              <br />A little space for yourself.
            </p>
            <a
              href={CONTACT_DETAILS.mapHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground hover:text-foreground"
            >
              {CONTACT_DETAILS.address}
            </a>
          </div>
        </div>
        <div className="marketing-container flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-border py-5 text-xs text-muted-foreground">
          <a href={`mailto:${CONTACT_DETAILS.email}`} className="break-all hover:text-foreground">
            {CONTACT_DETAILS.email}
          </a>
          <a
            href={CONTACT_DETAILS.instagramHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground"
          >
            Instagram <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
