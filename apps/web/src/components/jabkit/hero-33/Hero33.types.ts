import type {
  HTMLAttributes,
  MouseEventHandler,
} from "react";

export type Hero33FeatureIcon = "armchair" | "monitor" | "plane-takeoff";

export interface Hero33Action {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface Hero33NavItem {
  label: string;
  href: string;
}

export interface Hero33Feature {
  icon: Hero33FeatureIcon;
  title: string;
  description: string;
}

export interface Hero33Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  brand?: string;
  brandHref?: string;
  navItems?: Hero33NavItem[];
  headerAction?: Hero33Action;
  titleLines?: string[];
  primaryAction?: Hero33Action;
  secondaryAction?: Hero33Action;
  features?: Hero33Feature[];
  backgroundImage?: string;
  backgroundAlt?: string;
}
