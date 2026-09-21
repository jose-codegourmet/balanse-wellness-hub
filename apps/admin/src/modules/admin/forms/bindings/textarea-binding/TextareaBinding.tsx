"use client";

import { Textarea } from "@balanse/ui";
import type { FormFieldRenderProps } from "../../admin-form/AdminForm.schema";

export type TextareaBindingProps = FormFieldRenderProps &
  Omit<React.ComponentProps<typeof Textarea>, keyof FormFieldRenderProps | "value" | "onChange">;

export function TextareaBinding({
  value,
  onChange,
  onBlur,
  name,
  ref,
  rows = 3,
  ...props
}: TextareaBindingProps) {
  return (
    <Textarea
      {...props}
      ref={ref}
      name={name}
      rows={rows}
      value={value == null ? "" : String(value)}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
