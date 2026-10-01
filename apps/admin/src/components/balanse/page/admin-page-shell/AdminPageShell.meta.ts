import type * as React from "react";

export type AdminBreadcrumbItem = { label: string; href?: string };

export type AdminPageShellProps = {
  title: string;
  /** Media before the title, e.g. a customer's `UserAvatar` (`xl`). */
  leading?: React.ReactNode;
  /** Inline content between the title and description (nickname, status badges). */
  subtitle?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  breadcrumb?: AdminBreadcrumbItem[];
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  stats?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};
