import { sidebarSnapshotWithCounts } from "../admin-sidebar-nav/AdminSidebarNav.stories-data";
import type { AdminSidebarMobileProps } from "./AdminSidebarMobile.meta";

export const adminSidebarMobileDefaultValues: Partial<AdminSidebarMobileProps> = {
  pathname: "/dashboard",
  snapshot: sidebarSnapshotWithCounts,
  open: false,
};
