import type { HTMLAttributes } from "react";

export interface Calendar03Slot {
  value: string;
  label: string;
  available?: boolean;
}

export interface Calendar03Copy {
  timesLabel: string;
  previousMonth: string;
  nextMonth: string;
  emptyTimes: string;
}

export interface Calendar03Props
  extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  defaultMonth?: Date;
  defaultSelected?: Date;
  selected?: Date;
  onSelect?: (date: Date) => void;
  defaultTime?: string;
  time?: string;
  onTimeChange?: (time: string) => void;
  slots?: Calendar03Slot[];
  copy?: Partial<Calendar03Copy>;
  locale?: string;
  weekStartsOn?: 0 | 1;
}
