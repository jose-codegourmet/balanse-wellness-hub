import type { DatePickerProps, DateRangePickerProps } from "./DatePicker.schema";

export const datePickerDefaultValues: Partial<DatePickerProps> = {
  defaultValue: "2026-09-16",
  today: "2026-09-16",
  placeholder: "YYYY-MM-DD",
};

export const dateRangePickerDefaultValues: Partial<DateRangePickerProps> = {
  defaultValue: { from: "2026-09-01", to: "2026-09-16" },
  today: "2026-09-16",
  placeholder: "YYYY-MM-DD to YYYY-MM-DD",
};
