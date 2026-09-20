"use client";

import { DatePicker, useFieldContext } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type DateBindingProps = FormFieldRenderProps &
  Omit<
    React.ComponentProps<typeof DatePicker>,
    "value" | "onValueChange" | "onChange" | keyof FormFieldRenderProps
  >;

/** Context-blind — DatePicker does not read `useFieldContext()`. */
export function DateBinding({ value, onChange, onBlur, name, ref, ...props }: DateBindingProps) {
  const field = useFieldContext();
  const ymd = typeof value === "string" && value ? value : undefined;
  return (
    <DatePicker
      {...props}
      ref={ref}
      name={name}
      value={ymd}
      onBlur={onBlur}
      onValueChange={(next) => onChange(next ?? "")}
      id={field?.id}
      invalid={field?.invalid}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
    />
  );
}
