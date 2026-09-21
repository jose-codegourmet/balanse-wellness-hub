import type { ChoiceOption, OptionRowProps } from "./OptionRow.schema";

export const optionRowDefaultValues: Partial<OptionRowProps> = {
  label: "Maya Santos",
  description: "Reformer · senior coach",
  compact: false,
  reserveLeading: true,
};

export const choiceOptionDefaultValues: ChoiceOption = {
  value: "maya",
  label: "Maya Santos",
  description: "Reformer · senior coach",
};
