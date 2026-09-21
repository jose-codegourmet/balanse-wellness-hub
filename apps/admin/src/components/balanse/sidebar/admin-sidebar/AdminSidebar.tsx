"use client";

import { BrandLockup, TooltipProvider } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import { adminDashboardQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { AdminSidebarFooter } from "../admin-sidebar-footer/AdminSidebarFooter";
import { AdminSidebarMobile } from "../admin-sidebar-mobile/AdminSidebarMobile";
import { AdminSidebarNav } from "../admin-sidebar-nav/AdminSidebarNav";
import { AdminSidebarToggle } from "../admin-sidebar-toggle/AdminSidebarToggle";
import { useSidebarCollapsed } from "../useSidebarCollapsed";
import type { AdminSidebarProps } from "./AdminSidebar.meta";

export function AdminSidebar({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  pathname,
  snapshot: snapshotProp,
  mobileOpen,
  onMobileOpenChange,
  onSettings,
  onLogout,
  className,
  ...props
}: AdminSidebarProps) {
  const navId = useId();
  const { principal } = useMockPrincipal();
  const dashboardQuery = useQuery({
    ...adminDashboardQuery(principal.role),
    enabled: snapshotProp === undefined,
  });

  const { collapsed, toggleCollapsed } = useSidebarCollapsed({
    defaultCollapsed,
    collapsed: collapsedProp,
    onCollapsedChange,
  });
  const snapshot = snapshotProp ?? dashboardQuery.data ?? null;

  return (
    <TooltipProvider>
      <AdminSidebarMobile
        key={pathname}
        onLogout={onLogout}
        onOpenChange={onMobileOpenChange}
        onSettings={onSettings}
        open={mobileOpen}
        pathname={pathname}
        snapshot={snapshot}
      />
      <aside
        className={cn(
          "isolate sticky top-0 z-20 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-0.75 before:bg-(--balanse-gold) motion-reduce:transition-none motion-safe:transition-[width] motion-safe:duration-300 md:flex",
          collapsed ? "w-[4.75rem]" : "w-72",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "relative flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between gap-3",
          )}
        >
          {collapsed ? null : (
            <div className="min-w-0">
              <BrandLockup showTagline={false} />
              <p className="mt-1 text-[0.62rem] font-medium tracking-[0.18em] text-sidebar-foreground/55">
                Studio admin
              </p>
            </div>
          )}
          <AdminSidebarToggle collapsed={collapsed} controlsId={navId} onToggle={toggleCollapsed} />
        </div>
        <AdminSidebarNav collapsed={collapsed} id={navId} pathname={pathname} snapshot={snapshot} />
        <AdminSidebarFooter collapsed={collapsed} onLogout={onLogout} onSettings={onSettings} />
      </aside>
    </TooltipProvider>
  );
}
