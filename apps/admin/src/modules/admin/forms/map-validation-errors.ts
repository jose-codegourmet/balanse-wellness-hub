import type { ValidationFailedBody } from "@balanse/domain";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export type MappedFieldError = {
  path: string;
  type: string;
  message: string;
};

export type MappedFormError = {
  type: string;
  message: string;
};

export type MappedValidationErrors = {
  fieldErrors: MappedFieldError[];
  formErrors: MappedFormError[];
};

function isValidationFailedBody(value: unknown): value is ValidationFailedBody {
  if (typeof value !== "object" || value === null) return false;
  const record = value as { error?: unknown; fieldErrors?: unknown; formErrors?: unknown };
  return (
    record.error === "validation_failed" &&
    Array.isArray(record.fieldErrors) &&
    Array.isArray(record.formErrors)
  );
}

/**
 * Maps a BE-051 `ValidationFailedBody` onto RHF `setError` instructions.
 * Every mock failure is a plain `Error` from `applyMockEffects` — those land
 * on `root`. Do not string-parse the message.
 */
export function mapValidationErrors(error: unknown): MappedValidationErrors {
  if (isValidationFailedBody(error)) {
    return {
      fieldErrors: error.fieldErrors.map((item) => ({
        path: item.path,
        type: item.code,
        message: item.message,
      })),
      formErrors: error.formErrors.map((item) => ({
        type: item.code,
        message: item.message,
      })),
    };
  }

  const message = error instanceof Error ? error.message : "Something went wrong. Try again.";
  return {
    fieldErrors: [],
    formErrors: [{ type: "root", message }],
  };
}

export function applyMappedErrors<TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  mapped: MappedValidationErrors,
) {
  for (const fieldError of mapped.fieldErrors) {
    setError(fieldError.path as Path<TValues>, {
      type: fieldError.type,
      message: fieldError.message,
    });
  }
  for (const formError of mapped.formErrors) {
    setError("root", { type: formError.type, message: formError.message });
  }
}
