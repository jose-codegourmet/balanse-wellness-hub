import type { HTMLAttributes, ReactNode } from "react";

export interface ForgotPassword2Logo {
  name: string;
  href?: string;
  src?: string;
  alt?: string;
}

export interface ForgotPassword2Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  logo?: ForgotPassword2Logo;
  logoMark?: ReactNode;
  title?: string;
  description?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  emailDefaultValue?: string;
  submitLabel?: string;
  sentTitle?: string;
  sentDescription?: string;
  imageSrc?: string;
  imageAlt?: string;
  defaultSent?: boolean;
  onSendLink?: (email: string) => void;
}
