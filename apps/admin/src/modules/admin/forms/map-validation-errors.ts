import { ApiError } from "@balanse/api-client";
import type { ValidationFailedBody } from "@balanse/domain";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Some live-handler 404s are really "that reference doesn't resolve"
 * failures on a specific field (WIRE-0409, #361) — the handler throws a flat
 * `ApiError`, not a 422 `fieldErrors` entry, so there is no `path` to read.
 * Map the ones admin forms can hit back onto the field a person would fix.
 */
const NOT_FOUND_FIELD_BY_CODE: Record<string, string> = {
  class_not_found: "classId",
  venue_not_found: "venueId",
  coach_not_found: "coachIds",
};

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
 *
 * `ApiError` (a live `/api/*` write, WIRE-0409, #361) is handled separately
 * from the mock shape above: a 422 carries its own `fieldErrors`/`formErrors`
 * (`inactive_reference`, window errors like `ends_before_start`); a few 404s
 * for a dangling reference (`venue_not_found`, …) land on the matching field
 * via `NOT_FOUND_FIELD_BY_CODE` instead of a generic root message.
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

  if (error instanceof ApiError) {
    if (error.isValidationFailed) {
      return {
        fieldErrors: (error.fieldErrors ?? []).map((item) => ({
          path: item.path,
          type: item.code,
          message: item.message,
        })),
        formErrors: (error.formErrors ?? []).map((item) => ({
          type: item.code,
          message: item.message,
        })),
      };
    }
    const path = NOT_FOUND_FIELD_BY_CODE[error.code];
    if (path) {
      return { fieldErrors: [{ path, type: error.code, message: error.message }], formErrors: [] };
    }
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
