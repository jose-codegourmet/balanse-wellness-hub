import type { HTMLAttributes } from "react";

export interface Team11Member {
  src: string;
  alt: string;
  name: string;
  role: string;
  bio: string;
}

export interface Team11Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  description?: string;
  members?: Team11Member[];
  /** Freezes the hover bio card on a named member for previews and demos. */
  highlightedName?: string;
}
