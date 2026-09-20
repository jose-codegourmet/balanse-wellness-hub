import type { AdminSidebarMobileProps } from "./AdminSidebarMobile.schema";
import { sidebarSnapshotWithCounts } from "./AdminSidebarNav.defaults";

export const adminSidebarMobileDefaultValues: Partial<AdminSidebarMobileProps> = {
  pathname: "/dashboard",
  snapshot: sidebarSnapshotWithCounts,
  open: false,
};
