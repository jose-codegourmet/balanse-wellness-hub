"use client";

import {
  ADMIN_NAV_ITEMS,
  type AdminDashboardSnapshot,
  type AdminNavItem,
  isAdminNavActive,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { BrandLockup } from "@balanse/ui";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Moon,
  Repeat,
  Settings,
  Sun,
  Ticket,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/jabkit/avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { cn } from "@/components/jabkit/lib/cn";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const NAV_ICONS: Record<AdminNavItem["id"], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  schedule: CalendarDays,
  bookings: Ticket,
  payments: CreditCard,
  cancellations: UserX,
  reschedules: Repeat,
  customers: Users,
  coaches: UserRound,
  classes: Dumbbell,
  reports: BarChart3,
  staff: Users,
  settings: Settings,
};

const NAV_GROUPS: { label: string; ids: AdminNavItem["id"][] }[] = [
  {
    label: "Operations",
    ids: ["dashboard", "schedule", "bookings", "payments", "cancellations", "reschedules"],
  },
  { label: "Directory", ids: ["customers", "coaches", "classes", "staff"] },
  { label: "Studio", ids: ["reports", "settings"] },
];

function countForItem(
  id: AdminNavItem["id"],
  snapshot: AdminDashboardSnapshot | null,
): string | undefined {
  if (!snapshot) return undefined;
  if (id === "payments" && snapshot.pendingPayments > 0) return String(snapshot.pendingPayments);
  if (id === "cancellations" && snapshot.cancellations > 0) return String(snapshot.cancellations);
  if (id === "reschedules" && snapshot.reschedules > 0) return String(snapshot.reschedules);
  if (id === "bookings" && snapshot.waitlisted > 0) return String(snapshot.waitlisted);
  return undefined;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();
  const { resolvedTheme, setTheme } = useTheme();
  const navId = useId();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);

  useEffect(() => {
    void getMockAdapter().getAdminDashboard().then(setSnapshot);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, []);

  const dark = resolvedTheme === "dark";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <BrandLockup showTagline={false} />
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={open}
          aria-controls={navId}
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-4" />
        </button>
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id={navId}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background md:static md:z-0",
          open ? "flex" : "hidden md:flex",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <BrandLockup showTagline={false} />
          <button
            type="button"
            aria-label="Close navigation"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-5" aria-label="Admin">
          {NAV_GROUPS.map((group) => (
            <div className="pb-5" key={group.label}>
              <p className="px-3 text-xs font-normal text-muted-foreground">{group.label}</p>
              <ul className="mt-1 space-y-1">
                {group.ids.map((id) => {
                  const item = ADMIN_NAV_ITEMS.find((entry) => entry.id === id);
                  if (!item) return null;
                  const Icon = NAV_ICONS[item.id];
                  const active = isAdminNavActive(item, pathname);
                  const count = countForItem(item.id, snapshot);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-card text-primary shadow-sm ring-1 ring-border"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <Icon
                          className={cn("size-5", active ? "text-primary" : "text-foreground")}
                        />
                        <span className={active ? "text-primary" : undefined}>{item.label}</span>
                        {count ? (
                          <span className="ml-auto rounded-sm bg-card px-2 py-0.5 text-xs text-foreground shadow-sm ring-1 ring-border">
                            {count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-2 p-4">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-start gap-3 rounded-xl px-2 text-sm text-muted-foreground outline-none hover:bg-muted"
            onClick={() => setTheme(dark ? "light" : "dark")}
          >
            <span className="relative size-5">
              <Sun
                className={cn(
                  "absolute size-5 motion-safe:transition-[opacity,transform] motion-safe:duration-300",
                  dark ? "scale-50 opacity-0" : "scale-100 opacity-100",
                )}
              />
              <Moon
                className={cn(
                  "absolute size-5 motion-safe:transition-[opacity,transform] motion-safe:duration-300",
                  dark ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              />
            </span>
            Dark Mode
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-11 w-full items-center gap-2 rounded-xl bg-card px-2 shadow-sm ring-1 ring-border outline-none">
              <Avatar size="sm">
                <AvatarFallback>BA</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-left text-sm">Admin</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setPrincipal({ role: "guest" });
                  router.push("/login");
                  router.refresh();
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
