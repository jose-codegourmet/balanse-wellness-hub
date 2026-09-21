import type * as React from "react";

export type AdminSidebarFooterProps = React.ComponentProps<"div"> & {
  collapsed?: boolean;
  onSettings?: () => void;
  onLogout?: () => void;
};
