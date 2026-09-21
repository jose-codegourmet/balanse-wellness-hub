import type * as React from "react";

export type ChoiceOption = {
  value: string;
  label: string;
  leading?: React.ReactNode;
  description?: string;
  disabled?: boolean;
};

export type OptionRowProps = {
  label: React.ReactNode;
  leading?: React.ReactNode;
  description?: string;
  descriptionId?: string;
  compact?: boolean;
  reserveLeading?: boolean;
  className?: string;
};

export function choiceOptionFilterText(option: ChoiceOption | string): string {
  if (typeof option === "string") return option;
  return [option.label, option.description].filter(Boolean).join(" ");
}
