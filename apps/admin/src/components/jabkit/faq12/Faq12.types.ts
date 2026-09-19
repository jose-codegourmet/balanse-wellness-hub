import type { HTMLAttributes } from "react";

export interface Faq12Item {
  question: string;
  answer: string;
}

export interface Faq12Category {
  id?: string;
  label: string;
  items: Faq12Item[];
}

export interface Faq12Props extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  kicker?: string;
  title?: string;
  description?: string;
  categories?: Faq12Category[];
}
