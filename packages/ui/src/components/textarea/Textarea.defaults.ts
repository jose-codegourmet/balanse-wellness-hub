import type { TextareaProps } from "./Textarea.schema";

export const textareaDefaultValues: Partial<TextareaProps> = {
  size: "md",
  rows: 3,
  placeholder: "Type your message here.",
  className: "max-w-md",
};
