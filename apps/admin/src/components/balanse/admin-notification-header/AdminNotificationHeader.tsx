"use client";

import {
  ADMIN_NAV_ITEMS,
  CLASS_CHANGE_REVIEW_PERMISSIONS,
  DASHBOARD_READ_PERMISSIONS,
  hasAnyPermission,
  isAdminNavActive,
} from "@balanse/domain";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarClock,
  Check,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Ticket,
  UserRoundCog,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/jabkit/lib/cn";
import { canAccessAdminHref } from "@/lib/authorization/admin-access";
import { adminClassChangeRequestsQuery, adminDashboardQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { NAV_GROUPS, NAV_ICONS } from "../sidebar/sidebar-nav";
import type { AdminNotificationHeaderProps } from "./AdminNotificationHeader.meta";

export function AdminNotificationHeader({
  pathname,
  compact = false,
}: AdminNotificationHeaderProps) {
  const { principal, actor } = useMockPrincipal();
  const canReadDashboard = hasAnyPermission(actor, DASHBOARD_READ_PERMISSIONS);
  const { data, isPending, isError, refetch } = useQuery({
    ...adminDashboardQuery(principal),
    enabled: canReadDashboard,
  });
  const canReviewClassChanges = hasAnyPermission(actor, CLASS_CHANGE_REVIEW_PERMISSIONS);
  const classChangesQuery = useQuery({
    ...adminClassChangeRequestsQuery(principal),
    enabled: canReviewClassChanges,
  });
  const pendingClassChanges = canReviewClassChanges
    ? (classChangesQuery.data ?? []).filter((row) => row.status === "PENDING").length
    : 0;
  const items = data
    ? [
        {
          id: "bookings",
          label: "Bookings",
          detail: `${data.waitlisted} waitlisted booking${data.waitlisted === 1 ? "" : "s"}`,
          count: data.waitlisted,
          href: "/bookings",
          icon: Ticket,
        },
        {
          id: "payments",
          label: "Payments",
          detail: `${data.attention.payments} payment${data.attention.payments === 1 ? "" : "s"} need review`,
          count: data.attention.payments,
          href: "/payments",
          icon: CreditCard,
        },
        {
          id: "cancellations",
          label: "Cancellations",
          detail: `${data.attention.cancellations} request${data.attention.cancellations === 1 ? "" : "s"} awaiting review`,
          count: data.attention.cancellations,
          href: "/cancellations",
          icon: CircleAlert,
        },
        {
          id: "reschedules",
          label: "Reschedules",
          detail: `${data.attention.reschedules} request${data.attention.reschedules === 1 ? "" : "s"} awaiting review`,
          count: data.attention.reschedules,
          href: "/reschedules",
          icon: CalendarClock,
        },
        {
          id: "class-changes",
          label: "Class changes",
          detail: `${pendingClassChanges} coach request${pendingClassChanges === 1 ? "" : "s"} awaiting approval`,
          count: pendingClassChanges,
          href: "/schedule/requests",
          icon: UserRoundCog,
        },
      ].filter((item) => item.count > 0 && canAccessAdminHref(actor, item.href))
    : [];
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const loading = canReadDashboard && isPending;
  const failed = canReadDashboard && isError;
  const currentItem = ADMIN_NAV_ITEMS.find((item) => isAdminNavActive(item, pathname));
  const currentGroup = NAV_GROUPS.find(
    (group) => currentItem && group.ids.includes(currentItem.id),
  );
  const CurrentIcon = currentItem ? NAV_ICONS[currentItem.id] : CalendarClock;
  const status = loading
    ? "Checking requests"
    : failed
      ? "Inbox unavailable"
      : total
        ? `${total} awaiting review`
        : "All caught up";

  const inbox = (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            aria-label={
              total ? `Open ${total} operational notifications` : "Open operational notifications"
            }
            className={cn(
              "group relative h-10 gap-2.5 rounded-xl border border-border/70 bg-card/75 text-foreground shadow-xs transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              compact ? "w-10 px-0" : "px-3",
            )}
          />
        }
      >
        <Bell className="size-4" aria-hidden="true" />
        {!compact && <span className="text-xs font-semibold">Inbox</span>}
        {total > 0 && (
          <span
            className={cn(
              "grid min-w-5 place-items-center rounded-md bg-primary px-1.5 text-[0.625rem] font-bold leading-5 text-primary-foreground tabular-nums",
              compact && "absolute -right-1.5 -top-1.5 ring-2 ring-background",
            )}
            aria-hidden="true"
          >
            {total > 99 ? "99+" : total}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[23rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl"
      >
        <PopoverHeader className="relative gap-1 border-b border-border/60 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--balanse-gold)_28%,transparent),transparent_80%),linear-gradient(120deg,var(--popover),var(--muted))] px-5 py-5">
          <span
            aria-hidden="true"
            className="absolute inset-y-5 left-0 w-0.75 rounded-r-full bg-(--balanse-gold)"
          />
          <p className="mb-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your studio, in sync
          </p>
          <PopoverTitle className="font-display text-xl font-medium">Operations inbox</PopoverTitle>
          <PopoverDescription>
            {loading
              ? "Checking your studio’s queues…"
              : failed
                ? "We couldn’t load your requests."
                : total
                  ? `${total} items across ${items.length} queues need your attention.`
                  : "Nothing needs review right now."}
          </PopoverDescription>
        </PopoverHeader>
        {items.length ? (
          <ul className="space-y-1 p-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl p-3 outline-none transition-colors hover:bg-muted/45 focus-visible:bg-muted/45 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/35 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-5 py-8 text-center" role="status">
            <span className="mb-3 grid size-11 place-items-center rounded-full border border-border bg-muted/40">
              {loading ? (
                <Bell aria-hidden="true" className="size-5 motion-safe:animate-pulse" />
              ) : failed ? (
                <CircleAlert aria-hidden="true" className="size-5" />
              ) : (
                <Check aria-hidden="true" className="size-5" />
              )}
            </span>
            <p className="text-sm font-semibold">{status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {loading
                ? "This will only take a moment."
                : failed
                  ? "Please try loading your requests again."
                  : "You’re ready for what’s next."}
            </p>
            {failed && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                Try again
              </Button>
            )}
          </div>
        )}
        <p className="border-t border-border/60 bg-muted/15 px-5 py-3 text-[0.6875rem] text-muted-foreground">
          Bookings · Payments · Studio requests
        </p>
      </PopoverContent>
    </Popover>
  );

  if (compact) return inbox;

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border/70 bg-card bg-[radial-gradient(ellipse_at_95%_0%,color-mix(in_oklab,var(--balanse-gold)_28%,transparent),transparent_65%),linear-gradient(100deg,color-mix(in_oklab,var(--card)_80%,var(--balanse-beige)),var(--card)_55%,color-mix(in_oklab,var(--card)_78%,var(--balanse-tan)))] px-6 shadow-[0_2px_12px_-6px_color-mix(in_oklab,var(--balanse-muted-brown)_25%,transparent)] md:flex">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-muted/30 text-foreground">
          <CurrentIcon className="size-4" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Studio workspace
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{currentGroup?.label ?? "Studio"}</span>
            <ChevronRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
            <span className="truncate font-semibold">{currentItem?.label ?? "Overview"}</span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <p
          className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"
          role="status"
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              total ? "bg-(--balanse-gold-deep)" : "bg-muted-foreground/50",
              loading && "motion-safe:animate-pulse",
            )}
          />
          {status}
        </p>
        <span aria-hidden="true" className="hidden h-5 w-px bg-border lg:block" />
        {inbox}
      </div>
    </header>
  );
}
