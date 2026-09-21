import type * as React from "react";

export type AdminPageTab = {
  id: string;
  label: string;
  error?: boolean;
};

export type AdminPageTabsMobileBehavior = "tabs" | "stack";

export type AdminPageTabsProps = {
  tabs: readonly AdminPageTab[];
  value: string;
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
  /**
   * `tabs` (default): one panel at a time; chips below `md`.
   * `stack`: hide the tablist below `md` so the caller can show every section.
   */
  mobileBehavior?: AdminPageTabsMobileBehavior;
  /** Accessible name for the tablist. */
  label?: string;
};
