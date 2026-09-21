"use client";

import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@balanse/domain";
import { Separator, Tooltip, TooltipContent, TooltipTrigger } from "@balanse/ui";
import Link from "next/link";
import { useId } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import { COUNT_ARIA_NOUN, countForItem, NAV_GROUPS, NAV_ICONS } from "../sidebar-nav";
import type { AdminSidebarNavProps } from "./AdminSidebarNav.meta";

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
      className={cn(
        "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-5 [scrollbar-color:color-mix(in_oklab,var(--balanse-gold)_45%,transparent)_transparent] [scrollbar-width:thin]",
        className,
      )}
      aria-label="Admin"
      {...props}
    >
      {NAV_GROUPS.map((group, index) => {
        const headingId = `${headingPrefix}-${group.label}`;
        return (
          <div className={cn(collapsed ? "pb-3" : "pb-6")} key={group.label}>
            {collapsed && index > 0 ? <Separator className="mb-3 bg-sidebar-border" /> : null}
            <h2
              className={cn(
                "px-3 text-[0.68rem] font-medium tracking-[0.12em] text-sidebar-foreground/55",
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
                  "group relative flex h-11 w-full items-center rounded-lg text-left text-sm font-medium outline-none transition-[color,background-color,transform] duration-200 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  collapsed ? "justify-center px-0" : "gap-3 px-2.5",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-(--balanse-gold)"
                    : "text-sidebar-foreground/70 hover:translate-x-0.5 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                );
                const body = (
                  <>
                    <span
                      className={cn(
                        "relative grid size-7 shrink-0 place-items-center rounded-md transition-colors duration-200",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/65 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    {collapsed ? (
                      <span className="sr-only">{item.label}</span>
                    ) : (
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    )}
                    {count ? (
                      <span
                        className={cn(
                          "min-w-5 rounded-md px-1.5 py-0.5 text-center text-[0.65rem] font-semibold tabular-nums",
                          collapsed ? "absolute right-0 top-0 px-1" : "ml-auto",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "bg-sidebar-accent text-sidebar-foreground/70",
                        )}
                      >
                        <span aria-hidden="true">{Number(count) > 99 ? "99+" : count}</span>
                        <span className="sr-only">
                          {`${count} ${COUNT_ARIA_NOUN[item.id] ?? "notifications"}`}
                        </span>
                      </span>
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
