import type { HTMLAttributes, ReactNode } from "react";

export type ApplicationShell13BottomIcon =
  | "home"
  | "projects"
  | "team"
  | "settings";

export interface ApplicationShell13Brand {
  name: string;
  href?: string;
}

export interface ApplicationShell13NavItem {
  label: string;
  href: string;
  children?: ApplicationShell13NavItem[];
}

export interface ApplicationShell13NavGroup {
  label: string;
  href?: string;
  items: ApplicationShell13NavItem[];
}

export interface ApplicationShell13User {
  name: string;
  email: string;
  image?: string;
}

export interface ApplicationShell13Organization {
  name: string;
  plan?: string;
  initials?: string;
}

export interface ApplicationShell13BottomNavItem {
  label: string;
  href: string;
  icon: ApplicationShell13BottomIcon;
}

export interface ApplicationShell13Props
  extends HTMLAttributes<HTMLDivElement> {
  brand?: ApplicationShell13Brand;
  navGroups?: ApplicationShell13NavGroup[];
  organizations?: ApplicationShell13Organization[];
  user?: ApplicationShell13User;
  searchPlaceholder?: string;
  notificationCount?: number;
  bottomNav?: ApplicationShell13BottomNavItem[];
  children?: ReactNode;
}
