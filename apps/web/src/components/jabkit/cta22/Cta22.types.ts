import type { FormEventHandler, HTMLAttributes } from "react";

export type Cta22StorePlatform = "app-store" | "play";

export interface Cta22StoreLink {
  platform: Cta22StorePlatform;
  href: string;
  caption: string;
  label: string;
}

export interface Cta22Props
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "onSubmit"> {
  title?: string;
  description?: string;
  storeLinks?: Cta22StoreLink[];
  phoneImageSrc?: string;
  phoneImageAlt?: string;
  newsletterTitle?: string;
  newsletterDescription?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  subscribeLabel?: string;
  onSubscribe?: (email: string) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}
