"use client";

import { TimePicker, useFieldContext } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type TimeBindingProps = FormFieldRenderProps &
  Omit<
    React.ComponentProps<typeof TimePicker>,
    "value" | "onValueChange" | "onChange" | keyof FormFieldRenderProps
  >;

/** Context-blind — TimePicker does not read `useFieldContext()`. */
export function TimeBinding({
  value,
  onChange,
  onBlur,
  name,
  ref,
  step = 15,
  ...props
}: TimeBindingProps) {
  const field = useFieldContext();
  const hhmm = typeof value === "string" && value ? value : undefined;
  return (
    <TimePicker
      {...props}
      ref={ref}
      name={name}
      step={step}
      value={hhmm}
      onBlur={onBlur}
      onValueChange={(next) => onChange(next ?? "")}
      id={field?.id}
      invalid={field?.invalid}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
    />
  );
}
