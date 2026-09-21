import { sidebarSnapshotWithCounts } from "../admin-sidebar-nav/AdminSidebarNav.stories-data";
import type { AdminSidebarProps } from "./AdminSidebar.meta";

export const adminSidebarDefaultValues: Partial<AdminSidebarProps> = {
  pathname: "/dashboard",
  defaultCollapsed: false,
  snapshot: sidebarSnapshotWithCounts,
};
