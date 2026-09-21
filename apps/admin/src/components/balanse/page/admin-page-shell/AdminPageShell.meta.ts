import type * as React from "react";

export type AdminBreadcrumbItem = { label: string; href?: string };

export type AdminPageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumb?: AdminBreadcrumbItem[];
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  stats?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};
