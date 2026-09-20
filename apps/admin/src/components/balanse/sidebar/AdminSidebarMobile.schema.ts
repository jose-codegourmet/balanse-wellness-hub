import type { AdminDashboardSnapshot } from "@balanse/domain";
import type * as React from "react";

export type AdminSidebarMobileProps = React.ComponentProps<"div"> & {
  pathname: string;
  snapshot?: AdminDashboardSnapshot | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSettings?: () => void;
  onLogout?: () => void;
};
