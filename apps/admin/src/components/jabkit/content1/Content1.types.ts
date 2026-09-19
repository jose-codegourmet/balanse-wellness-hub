import type { HTMLAttributes } from "react";

export interface Content1Image {
  src: string;
  alt: string;
  caption?: string;
}

export interface Content1ListItem {
  title: string;
  text: string;
}

export interface Content1Callout {
  badge?: string;
  title: string;
  body: string;
}

export interface Content1Table {
  caption?: string;
  columns: string[];
  rows: string[][];
}

export type Content1Block =
  | { type: "paragraph"; text: string }
  | { type: "image"; image: Content1Image }
  | { type: "list"; items: Content1ListItem[] }
  | { type: "callout"; callout: Content1Callout }
  | { type: "table"; table: Content1Table };

export interface Content1Section {
  id: string;
  title: string;
  blocks: Content1Block[];
}

export interface Content1Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  kicker?: string;
  title?: string;
  description?: string;
  outlineLabel?: string;
  sections?: Content1Section[];
}
