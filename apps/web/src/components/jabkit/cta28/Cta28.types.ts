import type { HTMLAttributes, MouseEventHandler } from "react";

export type Cta28FeatureIcon =
  | "shield"
  | "workflow"
  | "users"
  | "gauge"
  | "lock"
  | "sparkles";

export interface Cta28Feature {
  label: string;
  icon?: Cta28FeatureIcon;
}

export interface Cta28Photo {
  src: string;
  alt: string;
}

export interface Cta28Action {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface Cta28Props extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  description?: string;
  features?: Cta28Feature[];
  action?: Cta28Action;
  photos?: Cta28Photo[];
}
