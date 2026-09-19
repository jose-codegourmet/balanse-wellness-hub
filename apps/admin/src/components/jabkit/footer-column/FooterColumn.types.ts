import type { HTMLAttributes } from "react";

export type FooterColumnSocialIcon =
  | "facebook"
  | "instagram"
  | "twitter"
  | "github"
  | "dribbble";

export type FooterColumnContactIcon = "mail" | "phone" | "map-pin";

export interface FooterColumnLink {
  label: string;
  href: string;
  indicator?: boolean;
}

export interface FooterColumnSocialLink {
  name: string;
  href: string;
  icon: FooterColumnSocialIcon;
}

export interface FooterColumnContactItem {
  icon: FooterColumnContactIcon;
  label: string;
  href?: string;
  address?: boolean;
}

export interface FooterColumnProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  brandName?: string;
  brandHref?: string;
  description?: string;
  logoSrc?: string;
  logoAlt?: string;
  socialLinks?: FooterColumnSocialLink[];
  aboutTitle?: string;
  aboutLinks?: FooterColumnLink[];
  servicesTitle?: string;
  serviceLinks?: FooterColumnLink[];
  helpTitle?: string;
  helpLinks?: FooterColumnLink[];
  contactTitle?: string;
  contactItems?: FooterColumnContactItem[];
  copyright?: string;
  rightsLabel?: string;
}
