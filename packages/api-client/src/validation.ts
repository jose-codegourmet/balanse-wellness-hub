import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ApiError } from "./errors";

/**
 * Maps a 422 `ApiError`'s `fieldErrors`/`formErrors` onto a React Hook Form
 * instance (WIRE-0102, #356). No-op for any other error — callers should
 * still surface non-validation errors themselves (toast, redirect, etc.).
 */
export function applyFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: ApiError,
): void {
  if (!error.isValidationFailed) return;
  for (const field of error.fieldErrors ?? []) {
    form.setError(field.path as Path<T>, { type: field.code, message: field.message });
  }
  for (const formError of error.formErrors ?? []) {
    form.setError("root", { type: formError.code, message: formError.message });
  }
}
