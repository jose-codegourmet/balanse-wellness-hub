import type { HTMLAttributes, ReactNode } from "react";

export interface Login4Logo {
  name: string;
  href?: string;
  src?: string;
  alt?: string;
}

export interface Login4Provider {
  id: string;
  label: string;
  href?: string;
  iconSrc?: string;
  invertOnDark?: boolean;
}

export interface Login4LoginPayload {
  email: string;
  password: string;
}

export interface Login4Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  logo?: Login4Logo;
  logoMark?: ReactNode;
  title?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  emailDefaultValue?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  submitLabel?: string;
  providers?: Login4Provider[];
  signupPrompt?: string;
  signupLabel?: string;
  signupHref?: string;
  onLogin?: (payload: Login4LoginPayload) => void;
  onProviderClick?: (providerId: string) => void;
}
