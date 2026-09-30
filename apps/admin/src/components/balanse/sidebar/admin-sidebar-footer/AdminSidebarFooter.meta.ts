import type * as React from "react";

export type AdminSidebarFooterProps = React.ComponentProps<"div"> & {
  collapsed?: boolean;
  /** Opens the signed-in staff member's own profile. */
  onProfile?: () => void;
  /** Permission-scoped studio, content, policy, and payment settings. */
  onStudioSettings?: () => void;
  onLogout?: () => void;
};
