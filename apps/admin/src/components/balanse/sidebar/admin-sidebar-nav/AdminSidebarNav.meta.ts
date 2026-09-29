/** Grouped admin navigation on a warm gold gradient with a champagne-gold active row and queue counts.
 * Semibold labels (bold when active) stagger on mount and whenever the sidebar expands or collapses.
 * Starts after 100 ms, with 45 ms between expanded rows and 25 ms between collapsed icons.
 * Honors reduced motion; route changes do not replay the entrance.
 * Use in the desktop rail or mobile drawer; collapsed mode retains labels via tooltips.
 * Pass permission-filtered items from the shell. Does not fetch data or own collapse state.
 */
import type { AdminDashboardSnapshot, AdminNavItem } from "@balanse/domain";
import type * as React from "react";

export type AdminSidebarNavProps = React.ComponentProps<"nav"> & {
  pathname: string;
  snapshot?: AdminDashboardSnapshot | null;
  collapsed?: boolean;
  items?: readonly AdminNavItem[];
};
