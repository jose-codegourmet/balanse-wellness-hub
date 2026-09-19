import type { HTMLAttributes } from "react";

export type CalendarWithLocalisationLocale = "en" | "es";

export interface CalendarWithLocalisationRange {
  from: Date;
  to?: Date;
}

export interface CalendarWithLocalisationCopy {
  title: string;
  description: string;
  languageLabel: string;
  previousMonth: string;
  nextMonth: string;
}

export interface CalendarWithLocalisationLocaleOption {
  value: CalendarWithLocalisationLocale;
  label: string;
  bcp47: string;
}

export interface CalendarWithLocalisationProps
  extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  defaultLocale?: CalendarWithLocalisationLocale;
  locale?: CalendarWithLocalisationLocale;
  onLocaleChange?: (locale: CalendarWithLocalisationLocale) => void;
  defaultMonth?: Date;
  numberOfMonths?: number;
  defaultSelected?: CalendarWithLocalisationRange;
  selected?: CalendarWithLocalisationRange;
  onSelect?: (range: CalendarWithLocalisationRange | undefined) => void;
  copy?: Partial<
    Record<CalendarWithLocalisationLocale, CalendarWithLocalisationCopy>
  >;
  localeOptions?: CalendarWithLocalisationLocaleOption[];
}
