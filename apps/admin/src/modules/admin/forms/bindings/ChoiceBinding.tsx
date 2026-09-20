"use client";

import {
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
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type ChoiceOption = { value: string; label: string };

export type ChoiceBindingProps = FormFieldRenderProps & {
  as?: "radio" | "native-select" | "select";
  options: ChoiceOption[];
};

export function ChoiceBinding({
  as = "native-select",
  options,
  value,
  onChange,
  onBlur,
  name,
  ref,
}: ChoiceBindingProps) {
  const stringValue = value == null ? "" : String(value);

  if (as === "radio") {
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

  if (as === "select") {
    return (
      <Select
        name={name}
        value={stringValue || null}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger ref={ref} onBlur={onBlur}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
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
