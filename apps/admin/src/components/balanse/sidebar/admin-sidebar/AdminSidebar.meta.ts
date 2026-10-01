import type { AdminDashboardSnapshot } from "@balanse/domain";
import type * as React from "react";

/** Admin shell navigation. Renders the inline collapsible rail (288px / 76px icon rail,
 * cookie-persisted) from `lg` (1024px) and delegates to `AdminSidebarMobile` below that,
 * so tablet portrait (iPad, 768–834px) keeps the full content width. The icon rail relies
 * on hover tooltips for labels, so it is a pointer affordance, not a tablet default.
 */
export type AdminSidebarProps = React.ComponentProps<"aside"> & {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  pathname: string;
  snapshot?: AdminDashboardSnapshot | null;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  onProfile?: () => void;
  onStudioSettings?: () => void;
  onLogout?: () => void;
};
