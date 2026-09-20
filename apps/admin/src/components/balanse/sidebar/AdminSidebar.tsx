"use client";

import type { AdminDashboardSnapshot } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { BrandLockup, TooltipProvider } from "@balanse/ui";
import { useEffect, useId, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { AdminSidebarProps } from "./AdminSidebar.schema";
import { AdminSidebarFooter } from "./AdminSidebarFooter";
import { AdminSidebarMobile } from "./AdminSidebarMobile";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { AdminSidebarToggle } from "./AdminSidebarToggle";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

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
  const { collapsed, toggleCollapsed } = useSidebarCollapsed({
    defaultCollapsed,
    collapsed: collapsedProp,
    onCollapsedChange,
  });
  const [loadedSnapshot, setLoadedSnapshot] = useState<AdminDashboardSnapshot | null>(null);

  useEffect(() => {
    if (snapshotProp !== undefined) return;
    // TODO(FE-ADM-015): adopt the shared dashboard query key so /dashboard fetches once.
    void getMockAdapter().getAdminDashboard().then(setLoadedSnapshot);
  }, [snapshotProp]);

  const snapshot = snapshotProp === undefined ? loadedSnapshot : snapshotProp;

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
