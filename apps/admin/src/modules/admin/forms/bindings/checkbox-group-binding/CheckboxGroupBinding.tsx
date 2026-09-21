"use client";

import {
  CheckboxGroup,
  CheckboxGroupItem,
  type CheckboxGroupOption,
  FieldLegend,
  FieldSet,
  useFieldContext,
} from "@balanse/ui";
import type { FormFieldRenderProps } from "../../admin-form/AdminForm.schema";

export type { CheckboxGroupOption };

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
      <CheckboxGroup>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <CheckboxGroupItem
              key={option.value}
              id={optionId}
              label={option.label}
              leading={option.leading}
              description={option.description}
              disabled={disabled || option.disabled}
              checked={selected.includes(option.value)}
              onCheckedChange={(next) => toggle(option.value, next === true)}
            />
          );
        })}
      </CheckboxGroup>
    </FieldSet>
  );
}
