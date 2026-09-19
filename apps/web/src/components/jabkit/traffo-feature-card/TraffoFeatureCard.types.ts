import type { HTMLAttributes, ReactNode } from "react";

export type TraffoFeatureCardTone = "success" | "warning" | "accent";

export interface TraffoFeatureCardProps extends HTMLAttributes<HTMLElement> {
  kicker?: string;
  title?: string;
  body?: string;
  tone?: TraffoFeatureCardTone;
  icon?: ReactNode;
}
