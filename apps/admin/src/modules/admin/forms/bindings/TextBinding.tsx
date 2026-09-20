"use client";

import { Input } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type TextBindingProps = FormFieldRenderProps &
  Omit<React.ComponentProps<typeof Input>, keyof FormFieldRenderProps | "value" | "onChange">;

export function TextBinding({
  value,
  onChange,
  onBlur,
  name,
  ref,
  type = "text",
  ...props
}: TextBindingProps) {
  return (
    <Input
      {...props}
      ref={ref}
      name={name}
      type={type}
      value={value == null ? "" : String(value)}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
