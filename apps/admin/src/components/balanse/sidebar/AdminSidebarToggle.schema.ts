import type * as React from "react";

export type AdminSidebarToggleProps = React.ComponentProps<"button"> & {
  collapsed: boolean;
  onToggle: () => void;
  controlsId: string;
};
