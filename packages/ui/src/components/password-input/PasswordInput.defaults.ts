import type { PasswordInputProps } from "./PasswordInput.schema";

export const passwordInputDefaultValues: Partial<PasswordInputProps> = {
  size: "md",
  placeholder: "Enter password",
  className: "max-w-sm",
  autoComplete: "current-password",
};
