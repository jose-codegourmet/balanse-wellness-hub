import { sidebarSnapshotWithCounts } from "../admin-sidebar-nav/AdminSidebarNav.defaults";
import type { AdminSidebarProps } from "./AdminSidebar.schema";

export const adminSidebarDefaultValues: Partial<AdminSidebarProps> = {
  pathname: "/dashboard",
  defaultCollapsed: false,
  snapshot: sidebarSnapshotWithCounts,
};
