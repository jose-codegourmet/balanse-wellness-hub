import type { AdminDashboardSnapshot, AdminNavItem } from "@balanse/domain";
import type * as React from "react";

export type AdminSidebarNavProps = React.ComponentProps<"nav"> & {
  pathname: string;
  snapshot?: AdminDashboardSnapshot | null;
  collapsed?: boolean;
  items?: readonly AdminNavItem[];
};
