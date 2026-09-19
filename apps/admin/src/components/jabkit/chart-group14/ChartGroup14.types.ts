import type { HTMLAttributes } from "react";

export type ChartGroup14Tone =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5";

export type ChartGroup14StatId = "revenue" | "users" | "sessions" | "bounce";

export interface ChartGroup14Preset {
  id: string;
  label: string;
  days: number;
}

export interface ChartGroup14Day {
  date: string;
  revenue: number;
  users: number;
  sessions: number;
  bounce: number;
}

export interface ChartGroup14Channel {
  id: string;
  label: string;
  value: number;
  tone: ChartGroup14Tone;
}

export interface ChartGroup14Page {
  path: string;
  views: number;
  share: number;
}

export interface ChartGroup14Person {
  id: string;
  name: string;
  role: string;
  lastActive: string;
  initials: string;
  src?: string;
}

export interface ChartGroup14Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  description?: string;
  presets?: ChartGroup14Preset[];
  defaultPresetId?: string;
  referenceDate?: string;
  series?: ChartGroup14Day[];
  channels?: ChartGroup14Channel[];
  pages?: ChartGroup14Page[];
  people?: ChartGroup14Person[];
  pagesHref?: string;
  peopleHref?: string;
}
