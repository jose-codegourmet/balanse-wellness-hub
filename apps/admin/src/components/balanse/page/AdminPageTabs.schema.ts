import type * as React from "react";

export type AdminPageTab = { id: string; label: string };

export type AdminPageTabsProps = {
  tabs: readonly AdminPageTab[];
  value: string;
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
};
