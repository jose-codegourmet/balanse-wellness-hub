"use client";

import {
  type ChoiceOption,
  NativeSelect,
  NativeSelectOption,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@balanse/ui";
import type { FormFieldRenderProps } from "../../admin-form/AdminForm.schema";

export type { ChoiceOption };

export type ChoiceBindingAs = "radio" | "native-select" | "select";

export type ChoiceBindingProps = FormFieldRenderProps & {
  as?: ChoiceBindingAs;
  options: ChoiceOption[];
};

/** ≤4 short labels → radio; ≤12 → Select; longer/searchable → ComboboxBinding. */
export function resolveChoiceAs(options: ChoiceOption[], as?: ChoiceBindingAs): ChoiceBindingAs {
  if (as) return as;
  const short = options.every((option) => option.label.length <= 24);
  if (options.length <= 4 && short) return "radio";
  return "select";
}

export function ChoiceBinding({
  as,
  options,
  value,
  onChange,
  onBlur,
  name,
  ref,
}: ChoiceBindingProps) {
  const resolved = resolveChoiceAs(options, as);
  const stringValue = value == null ? "" : String(value);

  if (resolved === "radio") {
    return (
      <RadioGroup
        name={name}
        value={stringValue}
        onBlur={onBlur}
        onValueChange={(next) => onChange(next ?? "")}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2 text-sm">
              <RadioGroupItem id={optionId} value={option.value} />
              <label htmlFor={optionId}>{option.label}</label>
            </div>
          );
        })}
      </RadioGroup>
    );
  }

  if (resolved === "select") {
    return (
      <Select
        name={name}
        value={stringValue || null}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger ref={ref} onBlur={onBlur} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              leading={option.leading}
              description={option.description}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <NativeSelect
      ref={ref}
      name={name}
      className="w-full"
      value={stringValue}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
