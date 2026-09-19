import type { HTMLAttributes } from "react";

export interface About6Image {
  src: string;
  alt: string;
  aspectClassName?: string;
}

export interface About6Story {
  title: string;
  description: string;
  images: About6Image[];
}

export interface About6Workplace {
  title: string;
  paragraphs: string[];
  images: About6Image[];
}

export interface About6Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  story?: About6Story;
  workplace?: About6Workplace;
}
