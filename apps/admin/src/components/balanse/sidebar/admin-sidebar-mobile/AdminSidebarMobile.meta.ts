import type { AdminDashboardSnapshot, AdminNavItem } from "@balanse/domain";
import type * as React from "react";

/** Sticky top bar (brand, compact inbox, hamburger) plus the left navigation sheet.
 * Visible below `lg` (1024px): phones and tablet portrait. Hidden once the inline
 * `AdminSidebar` rail takes over.
 */
export type AdminSidebarMobileProps = React.ComponentProps<"div"> & {
  pathname: string;
  items?: readonly AdminNavItem[];
  snapshot?: AdminDashboardSnapshot | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProfile?: () => void;
  onStudioSettings?: () => void;
  onLogout?: () => void;
};
