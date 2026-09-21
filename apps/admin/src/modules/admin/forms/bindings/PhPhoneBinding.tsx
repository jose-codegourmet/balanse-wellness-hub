"use client";

import { PhPhoneInput } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type PhPhoneBindingProps = FormFieldRenderProps &
  Omit<
    React.ComponentProps<typeof PhPhoneInput>,
    keyof FormFieldRenderProps | "value" | "onChange"
  >;

export function PhPhoneBinding({
  value,
  onChange,
  onBlur,
  name,
  ref,
  ...props
}: PhPhoneBindingProps) {
  return (
    <PhPhoneInput
      {...props}
      ref={ref}
      name={name}
      value={value == null ? "" : String(value)}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
