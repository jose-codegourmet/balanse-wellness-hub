import type { HTMLAttributes, ReactNode } from "react";

export interface TwoFactor2Logo {
  name: string;
  href?: string;
  src?: string;
  alt?: string;
}

export interface TwoFactor2Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  logo?: TwoFactor2Logo;
  logoMark?: ReactNode;
  title?: string;
  description?: string;
  codeLabel?: string;
  codeLength?: number;
  defaultCode?: string;
  submitLabel?: string;
  resendPrompt?: string;
  resendLabel?: string;
  resendHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
}
