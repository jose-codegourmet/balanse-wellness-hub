import type { AdminDashboardSnapshot } from "@balanse/domain";
import type * as React from "react";

export type AdminSidebarProps = React.ComponentProps<"aside"> & {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  pathname: string;
  snapshot?: AdminDashboardSnapshot | null;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  onSettings?: () => void;
  onLogout?: () => void;
};
