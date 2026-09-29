"use client";

import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@balanse/domain";
import { Separator, Tooltip, TooltipContent, TooltipTrigger } from "@balanse/ui";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <nav
      className={cn(
        "min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_0%_0%,color-mix(in_oklab,var(--balanse-gold)_24%,transparent),transparent_65%),linear-gradient(160deg,var(--sidebar)_15%,color-mix(in_oklab,var(--sidebar)_72%,var(--balanse-tan))_100%)] px-3 py-5 [scrollbar-color:color-mix(in_oklab,var(--balanse-gold)_45%,transparent)_transparent] [scrollbar-width:thin]",
        className,
      )}
      aria-label="Admin"
      {...props}
    >
      {NAV_GROUPS.map((group, index) => {
        const groupItems = group.ids
          .map((id) => items.find((entry) => entry.id === id))
          .filter((item): item is (typeof items)[number] => Boolean(item));
        if (groupItems.length === 0) return null;
        const precedingItemCount = NAV_GROUPS.slice(0, index).reduce(
          (total, previousGroup) =>
            total + previousGroup.ids.filter((id) => items.some((item) => item.id === id)).length,
          0,
        );
        const headingId = `${headingPrefix}-${group.label}`;
        return (
          <div className={cn(collapsed ? "pb-3" : "pb-5 last:pb-0")} key={group.label}>
            {collapsed && index > 0 ? <Separator className="mb-3 bg-sidebar-border" /> : null}
            <h2
              className={cn(
                "flex items-center gap-3 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/60",
                collapsed && "sr-only",
              )}
              id={headingId}
            >
              {group.label}
              <span aria-hidden="true" className="h-px flex-1 bg-sidebar-border/50" />
            </h2>
            <ul aria-labelledby={headingId} className={cn("space-y-1", !collapsed && "mt-2.5")}>
              {groupItems.map((item, itemIndex) => {
                const Icon = NAV_ICONS[item.id];
                const active = isAdminNavActive(item, pathname);
                const count = countForItem(item.id, snapshot);
                const linkClass = cn(
                  "group relative flex h-11 w-full items-center rounded-xl text-left text-[0.8125rem] font-semibold outline-none transition-[color,background-color,transform] duration-200 motion-reduce:transition-none motion-reduce:transform-none active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                  collapsed ? "justify-center px-0" : "gap-3 px-2.5",
                  active
                    ? "font-bold bg-(--balanse-beige) text-(--balanse-charcoal) bg-[linear-gradient(115deg,color-mix(in_oklab,var(--balanse-gold)_45%,var(--balanse-warm-white)),var(--balanse-beige))] ring-1 ring-inset ring-(--balanse-gold)/40 shadow-[0_4px_12px_-6px_color-mix(in_oklab,var(--balanse-muted-brown)_35%,transparent)] before:absolute before:inset-y-3 before:left-0 before:w-0.75 before:rounded-full before:bg-(--balanse-gold-deep)"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                );
                const body = (
                  <>
                    <span
                      className={cn(
                        "relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors motion-reduce:transition-none duration-200",
                        active
                          ? "bg-(--balanse-warm-white)/55 text-(--balanse-muted-brown)"
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
                          collapsed
                            ? "absolute -right-0.5 -top-0.5 px-1 ring-2 ring-sidebar"
                            : "ml-auto",
                          active
                            ? "bg-(--balanse-warm-white)/65 text-(--balanse-charcoal)"
                            : "bg-(--balanse-gold)/20 text-sidebar-foreground",
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
                  <motion.li
                    key={`${item.id}-${collapsed ? "collapsed" : "expanded"}`}
                    initial={reduceMotion ? false : { opacity: 0, x: collapsed ? 6 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.3,
                            delay:
                              0.1 + (precedingItemCount + itemIndex) * (collapsed ? 0.025 : 0.045),
                            ease: [0.22, 1, 0.36, 1],
                          }
                    }
                    className="motion-reduce:transform-none! motion-reduce:opacity-100!"
                  >
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
                  </motion.li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
