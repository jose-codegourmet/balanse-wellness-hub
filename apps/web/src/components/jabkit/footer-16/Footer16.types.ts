import type { HTMLAttributes, ReactNode } from "react";

export interface Footer16NavLink {
  label: string;
  href: string;
}

export interface Footer16LinkColumn {
  title: string;
  links: Footer16NavLink[];
}

export type Footer16SocialKind = "facebook" | "x" | "instagram" | "linkedin";

export interface Footer16SocialLink {
  label: string;
  href: string;
  kind?: Footer16SocialKind;
  icon?: ReactNode;
}

export interface Footer16LegalLink {
  label: string;
  href: string;
}

export interface Footer16Props extends HTMLAttributes<HTMLElement> {
  brandName?: string;
  brandHref?: string;
  brandLogo?: ReactNode;
  tagline?: string;
  linkColumns?: Footer16LinkColumn[];
  legalLinks?: Footer16LegalLink[];
  socialLinks?: Footer16SocialLink[];
  copyright?: string;
  backgroundImage?: string;
}
