import type { TimePickerProps } from "./TimePicker.schema";

export const timePickerDefaultValues: Partial<TimePickerProps> = {
  defaultValue: "08:00",
  step: 15,
  placeholder: "HH:mm",
};
