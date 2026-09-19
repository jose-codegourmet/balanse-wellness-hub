import type { HTMLAttributes, ReactNode } from "react";

export type ApplicationShell1IconName =
  | "studio"
  | "models"
  | "docs"
  | "settings"
  | "history"
  | "star"
  | "design"
  | "sales"
  | "travel"
  | "inbox"
  | "people"
  | "billing";

export interface ApplicationShell1NavChild {
  id: string;
  label: string;
  href: string;
}

export interface ApplicationShell1NavItem {
  id: string;
  label: string;
  href?: string;
  icon: ApplicationShell1IconName;
  children?: ApplicationShell1NavChild[];
}

export interface ApplicationShell1NavGroup {
  id: string;
  label: string;
  items: ApplicationShell1NavItem[];
}

export interface ApplicationShell1Breadcrumb {
  label: string;
  href?: string;
}

export interface ApplicationShell1Logo {
  name: string;
  href?: string;
  plan?: string;
}

export interface ApplicationShell1User {
  name: string;
  email: string;
  avatarSrc?: string;
}

export interface ApplicationShell1UserAction {
  id: string;
  label: string;
  href?: string;
  destructive?: boolean;
}

export interface ApplicationShell1Props
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  logo?: ApplicationShell1Logo;
  groups?: ApplicationShell1NavGroup[];
  breadcrumbs?: ApplicationShell1Breadcrumb[];
  user?: ApplicationShell1User;
  userActions?: ApplicationShell1UserAction[];
  activeId?: string;
  defaultCollapsed?: boolean;
  defaultOpenIds?: string[];
  children?: ReactNode;
}
