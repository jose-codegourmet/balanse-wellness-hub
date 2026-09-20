import type { InputProps } from "./Input.schema";

export const inputDefaultValues: Partial<InputProps> = {
  type: "text",
  size: "md",
  placeholder: "Enter text…",
  className: "max-w-sm",
};
