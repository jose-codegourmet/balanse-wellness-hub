import type { HTMLAttributes, MouseEventHandler } from "react";

export interface Hero1Action {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface Hero1NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface Hero1SocialLink {
  label: string;
  href: string;
}

export interface Hero1Props extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  brand?: string;
  brandHref?: string;
  navItems?: Hero1NavItem[];
  signIn?: Hero1Action;
  titleLead?: string;
  titleTrail?: string;
  description?: string;
  cta?: Hero1Action;
  socialLinks?: Hero1SocialLink[];
  scrollLabel?: string;
  backgroundImage?: string;
  backgroundAlt?: string;
}
