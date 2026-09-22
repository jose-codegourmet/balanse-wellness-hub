import type { AdminDashboardSnapshot, AdminNavItem } from "@balanse/domain";
import type * as React from "react";

export type AdminSidebarMobileProps = React.ComponentProps<"div"> & {
  pathname: string;
  items?: readonly AdminNavItem[];
  snapshot?: AdminDashboardSnapshot | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSettings?: () => void;
  onLogout?: () => void;
};
