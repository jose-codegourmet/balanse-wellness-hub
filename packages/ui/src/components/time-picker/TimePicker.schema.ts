import type * as React from "react";
import { z } from "zod";

export const timePickerSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export type TimePickerValues = z.infer<typeof timePickerSchema>;

type TimeInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "onValueChange" | "size" | "min" | "max" | "type" | "step"
>;

export type TimePickerProps = TimeInputProps & {
  value?: TimePickerValues;
  defaultValue?: TimePickerValues;
  onValueChange?: (value: TimePickerValues | undefined) => void;
  step?: number;
  after?: TimePickerValues;
  invalid?: boolean;
};
