"use client";

import { RichTextarea, useFieldContext } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type RichTextBindingProps = FormFieldRenderProps &
  Omit<
    React.ComponentProps<typeof RichTextarea>,
    keyof FormFieldRenderProps | "value" | "onChange"
  >;

/** Context-blind — reads `useFieldContext()` and wires aria explicitly. */
export function RichTextBinding({
  value,
  onChange,
  onBlur,
  name,
  ref,
  maxLength,
  ...props
}: RichTextBindingProps) {
  const field = useFieldContext();
  return (
    <RichTextarea
      {...props}
      ref={ref}
      name={name}
      maxLength={maxLength}
      value={value == null ? "" : String(value)}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      id={field?.id}
      invalid={field?.invalid}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
    />
  );
}
