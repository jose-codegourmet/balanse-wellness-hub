import { sidebarSnapshotWithCounts } from "../admin-sidebar-nav/AdminSidebarNav.defaults";
import type { AdminSidebarMobileProps } from "./AdminSidebarMobile.schema";

export const adminSidebarMobileDefaultValues: Partial<AdminSidebarMobileProps> = {
  pathname: "/dashboard",
  snapshot: sidebarSnapshotWithCounts,
  open: false,
};
