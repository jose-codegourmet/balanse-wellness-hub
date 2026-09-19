"use client";

import { CUSTOMER_NAV_ITEMS, isCustomerNavActive } from "@balanse/domain";
import { BrandLockup } from "@balanse/ui";
import { ArrowLeft, CalendarCheck2, CalendarDays, Flower2, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/jabkit/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/jabkit/dialog";

const icons = {
  home: CalendarCheck2,
  schedule: CalendarDays,
  profile: UserRound,
  achievements: Flower2,
};

export function BalansePortalNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = (
    <nav aria-label="Customer portal" className="portal-nav-links">
      {CUSTOMER_NAV_ITEMS.map((item) => {
        const Icon = icons[item.id];
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isCustomerNavActive(item, pathname) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
  const content = (
    <>
      <Link href="/" className="portal-brand" aria-label="Balansé home">
        <BrandLockup />
      </Link>
      <div className="portal-nav-heading">Your wellness space</div>
      {links}
      <div className="portal-sidebar-bottom">
        <Flower2 size={28} strokeWidth={1} aria-hidden="true" />
        <p>
          Make space
          <br />
          for yourself.
        </p>
        <Link href="/">
          <ArrowLeft size={16} aria-hidden="true" /> Back to the studio
        </Link>
      </div>
    </>
  );
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:p-4"
      >
        Skip to content
      </a>
      <aside className="portal-sidebar">{content}</aside>
      <Dialog open={open} onOpenChange={setOpen}>
        <header className="portal-mobile-header">
          <Link href="/" aria-label="Balansé home">
            <BrandLockup />
          </Link>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                className="border border-border"
                aria-label="Open portal menu"
              >
                <Menu size={20} /> Menu
              </Button>
            }
          />
        </header>
        <DialogContent
          showCloseButton={false}
          className="portal-menu-drawer translate-x-0 translate-y-0"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Your wellness space</DialogTitle>
          <DialogClose
            render={
              <Button variant="ghost" className="portal-menu-close" aria-label="Close portal menu">
                <X size={20} />
              </Button>
            }
          />
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
}
