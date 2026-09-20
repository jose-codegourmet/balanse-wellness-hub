import type { AdminSidebarProps } from "./AdminSidebar.schema";
import { sidebarSnapshotWithCounts } from "./AdminSidebarNav.defaults";

export const adminSidebarDefaultValues: Partial<AdminSidebarProps> = {
  pathname: "/dashboard",
  defaultCollapsed: false,
  snapshot: sidebarSnapshotWithCounts,
};
