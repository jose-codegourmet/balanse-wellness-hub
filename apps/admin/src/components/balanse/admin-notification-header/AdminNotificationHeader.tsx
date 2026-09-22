"use client";

import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarClock, ChevronRight, CircleAlert, CreditCard, Ticket } from "lucide-react";
import Link from "next/link";
import { adminDashboardQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { AdminNotificationHeaderProps } from "./AdminNotificationHeader.meta";

export function AdminNotificationHeader({
  pathname,
  compact = false,
}: AdminNotificationHeaderProps) {
  const { principal } = useMockPrincipal();
  const { data } = useQuery(adminDashboardQuery(principal));
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
      ].filter((item) => item.count > 0)
    : [];
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const inbox = (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              total ? `Open ${total} operational notifications` : "Open operational notifications"
            }
            className="relative"
          />
        }
      >
        <Bell />
        {total ? (
          <Badge
            className="absolute -right-2 -top-2 min-w-5 justify-center px-1 tabular-nums"
            variant="danger"
            appearance="solid"
            size="sm"
          >
            {total > 99 ? "99+" : total}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <PopoverHeader className="border-b border-border px-4 py-3">
          <PopoverTitle>Operations inbox</PopoverTitle>
          <PopoverDescription>
            {total ? "Requests that need staff attention." : "Nothing needs review right now."}
          </PopoverDescription>
        </PopoverHeader>
        {items.length ? (
          <ul className="p-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
                  >
                    <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{item.label}</span>
                      <span className="block text-sm text-muted-foreground">{item.detail}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">All caught up.</p>
        )}
      </PopoverContent>
    </Popover>
  );

  if (compact) return inbox;

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur md:flex">
      <p className="text-sm text-muted-foreground">
        {pathname === "/dashboard" ? "Today’s studio operations" : "Studio operations"}
      </p>
      {inbox}
    </header>
  );
}
