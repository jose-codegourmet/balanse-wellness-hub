"use client";

import { Checkbox, Switch } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type BooleanBindingProps = FormFieldRenderProps & {
  as?: "checkbox" | "switch";
  size?: React.ComponentProps<typeof Switch>["size"];
};

export function BooleanBinding({
  as = "checkbox",
  value,
  onChange,
  onBlur,
  name,
  ref,
  size,
}: BooleanBindingProps) {
  const checked = value === true;
  if (as === "switch") {
    return (
      <Switch
        ref={ref}
        name={name}
        size={size}
        checked={checked}
        onBlur={onBlur}
        onCheckedChange={(next) => onChange(next === true)}
      />
    );
  }
  return (
    <Checkbox
      ref={ref}
      name={name}
      checked={checked}
      onBlur={onBlur}
      onCheckedChange={(next) => onChange(next === true)}
    />
  );
}
