"use client";

import { CUSTOMER_NAV_ITEMS, customerInitials, isCustomerNavActive } from "@balanse/domain";
import { BrandLockup } from "@balanse/ui";
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarDays,
  ChevronUp,
  Flower2,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BalansePortalLogout } from "@/components/balanse/portal/BalansePortalLogout";
import { Button } from "@/components/jabkit/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/jabkit/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import "@/components/balanse/portal/portal.css";

const icons = {
  home: CalendarCheck2,
  schedule: CalendarDays,
  profile: UserRound,
  achievements: Flower2,
};

export type PortalAccount = {
  fullName: string;
  email: string;
};

function AccountIdentity({ account }: { account: PortalAccount }) {
  return (
    <>
      <span className="profile-avatar portal-account-avatar" aria-hidden="true">
        {customerInitials(account.fullName)}
      </span>
      <span className="portal-account-identity">
        <strong>{account.fullName}</strong>
        <span>{account.email}</span>
      </span>
    </>
  );
}

export function BalansePortalNavigation({ account }: { account?: PortalAccount }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }
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
        {/* Decoration only. It is the first thing to go when the column is
            short, so the account footer never gets pushed out of reach. */}
        <p className="portal-sidebar-motto">
          <Flower2 size={26} strokeWidth={1} aria-hidden="true" />
          <span>
            Make space
            <br />
            for yourself.
          </span>
        </p>
        {account ? (
          <>
            <div className="portal-sidebar-account portal-account-static">
              <AccountIdentity account={account} />
            </div>
            <div className="portal-account-menu">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="portal-sidebar-account portal-account-menu-trigger"
                  aria-label={`${account.fullName} account menu`}
                >
                  <AccountIdentity account={account} />
                  <ChevronUp
                    className="portal-account-menu-chevron"
                    size={16}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="top"
                  sideOffset={8}
                  className="portal-account-menu-content"
                >
                  <DropdownMenuItem onClick={() => go("/portal/profile")}>
                    <UserRound size={17} strokeWidth={1.5} aria-hidden="true" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/")}>
                    <ArrowLeft size={17} strokeWidth={1.5} aria-hidden="true" />
                    Back to the studio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
                    <LogOut size={17} strokeWidth={1.5} aria-hidden="true" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : null}
        <div className="portal-sidebar-actions">
          <Link
            href="/"
            className={account ? "portal-sidebar-action-inline" : undefined}
            onClick={() => setOpen(false)}
          >
            <ArrowLeft size={17} strokeWidth={1.5} aria-hidden="true" />
            <span>Back to the studio</span>
          </Link>
          <BalansePortalLogout
            open={logoutOpen}
            onOpenChange={setLogoutOpen}
            className={account ? "portal-sidebar-action-inline" : undefined}
          />
        </div>
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
