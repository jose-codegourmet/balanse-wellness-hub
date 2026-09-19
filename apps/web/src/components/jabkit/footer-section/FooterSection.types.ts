import type { FormEventHandler, HTMLAttributes } from "react";

export type FooterSectionTheme = "light" | "dark";

export type FooterSectionContactIcon = "map-pin" | "phone" | "mail";

export type FooterSectionSocialIcon =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "github"
  | "youtube";

export interface FooterSectionLink {
  label: string;
  href: string;
}

export interface FooterSectionContactItem {
  icon: FooterSectionContactIcon;
  label: string;
  href?: string;
}

export interface FooterSectionSocialLink {
  name: string;
  href: string;
  icon: FooterSectionSocialIcon;
}

export interface FooterSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "onSubmit"> {
  brandTitle?: string;
  brandDescription?: string;
  emailPlaceholder?: string;
  subscribeLabel?: string;
  onSubscribe?: (email: string) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  linksTitle?: string;
  links?: FooterSectionLink[];
  contactTitle?: string;
  contactItems?: FooterSectionContactItem[];
  socialTitle?: string;
  socialLinks?: FooterSectionSocialLink[];
  legalLinks?: FooterSectionLink[];
  copyright?: string;
  theme?: FooterSectionTheme;
  defaultTheme?: FooterSectionTheme;
  onThemeChange?: (theme: FooterSectionTheme) => void;
  showThemeToggle?: boolean;
}
