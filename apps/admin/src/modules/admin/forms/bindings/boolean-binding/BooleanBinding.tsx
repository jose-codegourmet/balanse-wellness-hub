"use client";

import { Checkbox, Switch } from "@balanse/ui";
import type { FormFieldRenderProps } from "../../admin-form/AdminForm.schema";

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
      <div data-slot="switch" className="flex min-h-11 items-center justify-end">
        <Switch
          ref={ref}
          name={name}
          size={size}
          checked={checked}
          onBlur={onBlur}
          onCheckedChange={(next) => onChange(next === true)}
        />
      </div>
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
