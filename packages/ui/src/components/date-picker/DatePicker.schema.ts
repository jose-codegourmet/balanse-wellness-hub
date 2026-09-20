import type * as React from "react";
import { z } from "zod";

export const datePickerSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export type DatePickerValues = z.infer<typeof datePickerSchema>;

export const dateRangeSchema = z.object({
  from: datePickerSchema,
  to: datePickerSchema,
});

export type DateRangePickerValues = z.infer<typeof dateRangeSchema>;

type DateInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "onValueChange" | "size" | "min" | "max" | "type"
>;

export type DatePickerProps = DateInputProps & {
  value?: DatePickerValues;
  defaultValue?: DatePickerValues;
  onValueChange?: (value: DatePickerValues | undefined) => void;
  min?: DatePickerValues;
  max?: DatePickerValues;
  disabledDates?: DatePickerValues[];
  invalid?: boolean;
  today?: DatePickerValues;
};

export type DateRangePickerProps = DateInputProps & {
  value?: DateRangePickerValues;
  defaultValue?: DateRangePickerValues;
  onValueChange?: (value: DateRangePickerValues | undefined) => void;
  min?: DatePickerValues;
  max?: DatePickerValues;
  disabledDates?: DatePickerValues[];
  invalid?: boolean;
  today?: DatePickerValues;
};
