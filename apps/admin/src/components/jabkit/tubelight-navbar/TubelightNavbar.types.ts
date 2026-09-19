import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes } from "react";

export type TubelightNavbarIconName =
  | "home"
  | "user"
  | "briefcase"
  | "file-text"
  | "sparkles"
  | "camera"
  | "book-open"
  | "mail";

export interface TubelightNavbarItem {
  name: string;
  href: string;
  icon: LucideIcon | TubelightNavbarIconName;
}

export interface TubelightNavbarProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  items?: TubelightNavbarItem[];
  activeName?: string;
  defaultActiveName?: string;
  onActiveChange?: (name: string) => void;
}
