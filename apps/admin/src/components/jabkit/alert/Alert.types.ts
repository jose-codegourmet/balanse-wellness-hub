import type { HTMLAttributes } from "react";

export type AlertVariant = "default" | "destructive";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export type AlertTitleProps = HTMLAttributes<HTMLDivElement>;
export type AlertDescriptionProps = HTMLAttributes<HTMLDivElement>;
export type AlertActionProps = HTMLAttributes<HTMLDivElement>;
