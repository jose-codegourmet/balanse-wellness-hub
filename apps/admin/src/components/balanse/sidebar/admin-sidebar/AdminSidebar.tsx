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
import type { AdminSidebarProps } from "./AdminSidebar.schema";

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
  const { collapsed, toggleCollapsed } = useSidebarCollapsed({
    defaultCollapsed,
    collapsed: collapsedProp,
    onCollapsedChange,
  });
  const query = useQuery({
    ...adminDashboardQuery(principal.role),
    enabled: snapshotProp === undefined,
  });
  const snapshot = snapshotProp === undefined ? (query.data ?? null) : snapshotProp;

  return (
    <TooltipProvider>
      <AdminSidebarMobile
        onLogout={onLogout}
        onOpenChange={onMobileOpenChange}
        onSettings={onSettings}
        open={mobileOpen}
        pathname={pathname}
        snapshot={snapshot}
      />
      <aside
        className={cn(
          "z-40 hidden flex-col border-r border-border bg-background motion-reduce:transition-none motion-safe:transition-[width] motion-safe:duration-200 md:static md:z-0 md:flex",
          collapsed ? "w-16" : "w-64",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {collapsed ? null : <BrandLockup showTagline={false} />}
          <AdminSidebarToggle collapsed={collapsed} controlsId={navId} onToggle={toggleCollapsed} />
        </div>
        <AdminSidebarNav collapsed={collapsed} id={navId} pathname={pathname} snapshot={snapshot} />
        <AdminSidebarFooter collapsed={collapsed} onLogout={onLogout} onSettings={onSettings} />
      </aside>
    </TooltipProvider>
  );
}
