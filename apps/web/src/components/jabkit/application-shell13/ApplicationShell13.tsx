"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/jabkit/avatar/Avatar";
import { Badge } from "@/components/jabkit/badge";
import { Button } from "@/components/jabkit/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/jabkit/dialog/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { Input } from "@/components/jabkit/input";
import { Separator } from "@/components/jabkit/separator";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  ApplicationShell13BottomIcon,
  ApplicationShell13BottomNavItem,
  ApplicationShell13Brand,
  ApplicationShell13NavGroup,
  ApplicationShell13NavItem,
  ApplicationShell13Organization,
  ApplicationShell13Props,
  ApplicationShell13User,
} from "./ApplicationShell13.types";

const defaultBrand: ApplicationShell13Brand = {
  name: "Harbor",
  href: "#dashboard",
};

const defaultNavGroups: ApplicationShell13NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "#dashboard" },
      { label: "Analytics", href: "#analytics" },
      { label: "Reports", href: "#reports" },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "All projects", href: "#projects" },
      { label: "Active", href: "#projects-active" },
      { label: "Archived", href: "#projects-archived" },
      {
        label: "Templates",
        href: "#templates",
        children: [
          { label: "Product brief", href: "#template-brief" },
          { label: "Sprint board", href: "#template-sprint" },
        ],
      },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Members", href: "#members" },
      { label: "Roles", href: "#roles" },
      { label: "Invites", href: "#invites" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "General", href: "#workspace" },
      { label: "Billing", href: "#billing" },
      { label: "Integrations", href: "#integrations" },
    ],
  },
];

const defaultOrganizations: ApplicationShell13Organization[] = [
  { name: "Harbor Labs", plan: "Team", initials: "HL" },
  { name: "Northline", plan: "Pro", initials: "NL" },
  { name: "Fieldwork", plan: "Starter", initials: "FW" },
];

const defaultUser: ApplicationShell13User = {
  name: "Amara Cole",
  email: "amara@harbor.studio",
  image: "/assets/2d2e13918d75791c.webp",
};

const defaultBottomNav: ApplicationShell13BottomNavItem[] = [
  { label: "Home", href: "#dashboard", icon: "home" },
  { label: "Projects", href: "#projects", icon: "projects" },
  { label: "Team", href: "#members", icon: "team" },
  { label: "Settings", href: "#workspace", icon: "settings" },
];

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cn("size-4", className),
  };
}

function Glyph({
  name,
  className,
}: {
  name: ApplicationShell13BottomIcon | "bell" | "search" | "menu" | "chevron";
  className?: string;
}) {
  const common = iconProps(className);
  if (name === "home") {
    return (
      <svg aria-hidden="true" {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "projects") {
    return (
      <svg aria-hidden="true" {...common}>
        <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h4L11 8h7.5A1.5 1.5 0 0 1 20 9.5v8A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
      </svg>
    );
  }
  if (name === "team") {
    return (
      <svg aria-hidden="true" {...common}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M4 19a5 5 0 0 1 10 0" />
        <path d="M14 19a4 4 0 0 1 6.5-3.1" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg aria-hidden="true" {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V10c.3.6.9 1 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg aria-hidden="true" {...common}>
        <path d="M6 9a6 6 0 1 1 12 0c0 7 2 8 2 8H4s2-1 2-8" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg aria-hidden="true" {...common}>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }
  if (name === "menu") {
    return (
      <svg aria-hidden="true" {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" {...common}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavItemList({ items }: { items: ApplicationShell13NavItem[] }) {
  return items.map((item) => {
    if (item.children?.length) {
      return (
        <DropdownMenuSub key={item.label}>
          <DropdownMenuSubTrigger>{item.label}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {item.children.map((child) => (
              <DropdownMenuItem
                key={child.label}
                render={<a href={child.href} />}
              >
                {child.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }
    return (
      <DropdownMenuItem key={item.label} render={<a href={item.href} />}>
        {item.label}
      </DropdownMenuItem>
    );
  });
}

function NavGroupMenu({ group }: { group: ApplicationShell13NavGroup }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors",
          "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          "data-popup-open:bg-muted data-popup-open:text-foreground data-popup-open:font-medium",
        )}
      >
        {group.label}
        <Glyph name="chevron" className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <NavItemList items={group.items} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SearchField({
  id,
  placeholder,
  className,
}: {
  id: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <label className="sr-only" htmlFor={id}>
        Search
      </label>
      <Glyph
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        name="search"
      />
      <Input
        className="h-9 rounded-full bg-muted/40 pr-3 pl-8"
        id={id}
        placeholder={placeholder}
        type="search"
      />
    </div>
  );
}

function OrganizationSwitcher({
  organizations,
}: {
  organizations: ApplicationShell13Organization[];
}) {
  const [active, setActive] = useState(
    organizations[0] ?? defaultOrganizations[0],
  );
  const initials = active.initials ?? initialsFromName(active.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 max-w-44 items-center gap-2 rounded-lg border border-border bg-background px-2 text-left text-sm outline-none",
          "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
          {initials}
        </span>
        <span className="hidden min-w-0 flex-1 truncate font-medium sm:block">
          {active.name}
        </span>
        <Glyph
          className="hidden size-3.5 text-muted-foreground sm:block"
          name="chevron"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {organizations.map((org) => (
          <DropdownMenuItem key={org.name} onClick={() => setActive(org)}>
            <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
              {org.initials ?? initialsFromName(org.name)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span>{org.name}</span>
              {org.plan ? (
                <span className="text-xs text-muted-foreground">
                  {org.plan}
                </span>
              ) : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ user }: { user: ApplicationShell13User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar size="sm">
          {user.image ? <AvatarImage alt="" src={user.image} /> : null}
          <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>
          <span className="block text-sm text-foreground">{user.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href="#profile" />}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href="#account" />}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav({
  groups,
  onNavigate,
}: {
  groups: ApplicationShell13NavGroup[];
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="Application" className="flex flex-col gap-4 px-4 pb-6">
      {groups.map((group) => (
        <div className="flex flex-col gap-1" key={group.label}>
          <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.label}
          </p>
          {group.items.map((item) => (
            <div className="flex flex-col" key={item.label}>
              <a
                className="rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-muted"
                href={item.href}
                onClick={onNavigate}
              >
                {item.label}
              </a>
              {item.children?.map((child) => (
                <a
                  className="rounded-lg py-1.5 pr-2 pl-5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  href={child.href}
                  key={child.label}
                  onClick={onNavigate}
                >
                  {child.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}

function DefaultMain() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Track active work, team load, and workspace health from a single
          surface.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active projects", value: "12" },
          { label: "Open tasks", value: "48" },
          { label: "Team online", value: "9" },
        ].map((stat) => (
          <div
            className="rounded-xl border border-border bg-card p-4 text-card-foreground"
            key={stat.label}
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-medium">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApplicationShell13({
  className,
  brand = defaultBrand,
  navGroups = defaultNavGroups,
  organizations = defaultOrganizations,
  user = defaultUser,
  searchPlaceholder = "Search the workspace…",
  notificationCount = 3,
  bottomNav = defaultBottomNav,
  children,
  ...props
}: ApplicationShell13Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(
    bottomNav[0]?.href ?? "#dashboard",
  );
  const searchId = "application-shell13-search";
  const mobileSearchId = "application-shell13-search-mobile";

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-muted/30 text-foreground",
        className,
      )}
      data-slot="application-shell13"
      {...props}
    >
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="grid items-center gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(12rem,28rem)_minmax(0,1fr)]">
          <div className="flex items-center gap-2">
            <Button
              aria-expanded={menuOpen}
              aria-label="Open navigation"
              className="size-9 px-0 md:hidden"
              onClick={() => setMenuOpen(true)}
              size="sm"
              variant="ghost"
            >
              <Glyph name="menu" />
            </Button>
            <a
              className="flex items-center gap-2 font-medium tracking-tight"
              href={brand.href ?? "#"}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
                {brand.name.slice(0, 1)}
              </span>
              <span>{brand.name}</span>
            </a>
          </div>
          <SearchField
            className="hidden md:block"
            id={searchId}
            placeholder={searchPlaceholder}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              aria-label={
                notificationCount
                  ? `${notificationCount} notifications`
                  : "Notifications"
              }
              className="relative size-9 px-0"
              size="sm"
              variant="ghost"
            >
              <Glyph name="bell" />
              {notificationCount > 0 ? (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1">
                  {notificationCount}
                </Badge>
              ) : null}
            </Button>
            <UserMenu user={user} />
            <OrganizationSwitcher organizations={organizations} />
          </div>
        </div>
        <SearchField
          className="px-4 pb-3 md:hidden"
          id={mobileSearchId}
          placeholder={searchPlaceholder}
        />
        <Separator className="hidden md:block" />
        <nav
          aria-label="Sections"
          className="hidden items-center gap-1 px-3 py-1.5 md:flex"
        >
          {navGroups.map((group) => (
            <NavGroupMenu group={group} key={group.label} />
          ))}
        </nav>
      </header>

      <Dialog onOpenChange={setMenuOpen} open={menuOpen}>
        <DialogContent
          className="top-0 left-0 h-dvh w-[min(20rem,calc(100%-1.5rem))] max-w-none translate-x-0 translate-y-0 gap-0 rounded-none rounded-r-xl p-0 sm:max-w-none"
          showCloseButton
        >
          <DialogHeader className="border-b border-border p-4">
            <DialogTitle>{brand.name}</DialogTitle>
          </DialogHeader>
          <MobileNav groups={navGroups} onNavigate={() => setMenuOpen(false)} />
        </DialogContent>
      </Dialog>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24 md:pb-8">
        {children ?? <DefaultMain />}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
      >
        <ul className="grid grid-cols-4">
          {bottomNav.map((item) => {
            const active = item.href === activeHref;
            return (
              <li key={item.label}>
                <a
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-xs",
                    active
                      ? "font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                  href={item.href}
                  onClick={() => setActiveHref(item.href)}
                >
                  <Glyph name={item.icon} />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
