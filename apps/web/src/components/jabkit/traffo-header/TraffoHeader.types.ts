import type { HTMLAttributes } from "react";

export interface TraffoHeaderLink {
  label: string;
  href: string;
  hasMenu?: boolean;
}

export interface TraffoHeaderProps extends HTMLAttributes<HTMLElement> {
  brand?: string;
  brandHref?: string;
  links?: TraffoHeaderLink[];
  ctaLabel?: string;
  ctaHref?: string;
  menuLabel?: string;
}
