"use client";

import { Checkbox, FieldLegend, FieldSet, useFieldContext } from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type CheckboxGroupOption = { value: string; label: string };

export type CheckboxGroupBindingProps = FormFieldRenderProps & {
  options: CheckboxGroupOption[];
  legend?: string;
  disabled?: boolean;
};

/** Composed locally — `@balanse/ui` has no CheckboxGroup primitive. */
export function CheckboxGroupBinding({
  options,
  legend,
  disabled,
  value,
  onChange,
  onBlur,
  name,
}: CheckboxGroupBindingProps) {
  const field = useFieldContext();
  const selected = Array.isArray(value) ? (value as string[]) : [];

  function toggle(optionValue: string, checked: boolean) {
    const next = checked
      ? [...selected, optionValue]
      : selected.filter((item) => item !== optionValue);
    onChange(next);
  }

  return (
    <FieldSet
      name={name}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      onBlur={onBlur}
    >
      {legend ? <FieldLegend variant="label">{legend}</FieldLegend> : null}
      <div data-slot="checkbox-group" className="grid gap-2">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                id={optionId}
                disabled={disabled}
                checked={selected.includes(option.value)}
                onCheckedChange={(next) => toggle(option.value, next === true)}
              />
              <label htmlFor={optionId}>{option.label}</label>
            </div>
          );
        })}
      </div>
    </FieldSet>
  );
}
