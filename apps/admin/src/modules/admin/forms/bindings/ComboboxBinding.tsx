"use client";

import {
  choiceOptionFilterText,
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@balanse/ui";
import type { FormFieldRenderProps } from "../AdminForm.schema";
import type { ChoiceOption } from "./ChoiceBinding";

export type ComboboxBindingProps = FormFieldRenderProps & {
  options: ChoiceOption[];
  placeholder?: string;
  emptyLabel?: string;
};

export function ComboboxBinding({
  options,
  placeholder = "Search…",
  emptyLabel = "No matches.",
  value,
  onChange,
  onBlur,
  name,
}: ComboboxBindingProps) {
  const stringValue = value == null ? "" : String(value);
  const selected = options.find((option) => option.value === stringValue) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(next) => onChange(next?.value ?? "")}
      itemToStringLabel={(item) => choiceOptionFilterText(item)}
    >
      <ComboboxInput
        name={name}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full"
        showClear
        leading={selected?.leading}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem
                key={item.value}
                value={item}
                leading={item.leading}
                description={item.description}
                disabled={item.disabled}
              >
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
