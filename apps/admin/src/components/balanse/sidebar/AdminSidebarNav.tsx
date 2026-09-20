"use client";

import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@balanse/domain";
import { CountBadge, Separator, Tooltip, TooltipContent, TooltipTrigger } from "@balanse/ui";
import Link from "next/link";
import { useId } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { AdminSidebarNavProps } from "./AdminSidebarNav.schema";
import { COUNT_ARIA_NOUN, countForItem, NAV_GROUPS, NAV_ICONS } from "./sidebar-nav";

function countAria(id: keyof typeof COUNT_ARIA_NOUN, raw: string) {
  const noun = COUNT_ARIA_NOUN[id] ?? "items";
  return `${raw} ${noun}`;
}

export function AdminSidebarNav({
  pathname,
  snapshot = null,
  collapsed = false,
  items = ADMIN_NAV_ITEMS,
  className,
  ...props
}: AdminSidebarNavProps) {
  const headingPrefix = useId();

  return (
    <nav
      className={cn("flex-1 overflow-x-hidden overflow-y-auto px-2 py-5", className)}
      aria-label="Admin"
      {...props}
    >
      {NAV_GROUPS.map((group, index) => {
        const headingId = `${headingPrefix}-${group.label}`;
        return (
          <div className={cn(collapsed ? "pb-2" : "pb-5")} key={group.label}>
            {collapsed && index > 0 ? <Separator className="mb-2" /> : null}
            <h2
              className={cn(
                "px-3 text-xs font-normal text-muted-foreground",
                collapsed && "sr-only",
              )}
              id={headingId}
            >
              {group.label}
            </h2>
            <ul aria-labelledby={headingId} className={cn("space-y-1", !collapsed && "mt-1")}>
              {group.ids.map((id) => {
                const item = items.find((entry) => entry.id === id);
                if (!item) return null;
                const Icon = NAV_ICONS[item.id];
                const active = isAdminNavActive(item, pathname);
                const count = countForItem(item.id, snapshot);
                const linkClass = cn(
                  "flex h-11 w-full items-center rounded-xl text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  collapsed ? "justify-center px-0" : "gap-3 px-3",
                  active
                    ? "bg-card text-primary shadow-sm ring-1 ring-border"
                    : "text-foreground hover:bg-muted",
                );
                const body = (
                  <>
                    <span className="relative inline-flex">
                      <Icon className={cn("size-5", active ? "text-primary" : "text-foreground")} />
                      {collapsed && count ? (
                        <CountBadge
                          aria-label={countAria(item.id, count)}
                          className="absolute -top-1.5 -right-2 h-4 min-w-4 px-0.5 text-[12px] leading-none"
                          count={Number(count)}
                          max={99}
                        />
                      ) : null}
                    </span>
                    {collapsed ? (
                      <span className="sr-only">{item.label}</span>
                    ) : (
                      <span className={active ? "text-primary" : undefined}>{item.label}</span>
                    )}
                    {!collapsed && count ? (
                      <CountBadge
                        aria-label={countAria(item.id, count)}
                        className="ml-auto"
                        count={Number(count)}
                        max={99}
                      />
                    ) : null}
                  </>
                );

                return (
                  <li key={item.id}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              aria-current={active ? "page" : undefined}
                              className={linkClass}
                              href={item.href}
                            />
                          }
                        >
                          {body}
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={linkClass}
                        href={item.href}
                      >
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
