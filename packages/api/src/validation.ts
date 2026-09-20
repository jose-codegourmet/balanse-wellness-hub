import {
  EMAIL_FORMAT_RE,
  FIELD_CONSTRAINTS,
  isPhMobile,
  isPolicyVersion,
  type ValidationErrorCode,
  type ValidationFailedBody,
  type ValidationFieldError,
} from "@balanse/domain";
import { ApiError } from "./errors";

export class ValidationFailed extends ApiError {
  constructor(
    fieldErrors: ValidationFieldError[],
    formErrors: ValidationFailedBody["formErrors"] = [],
  ) {
    super(422, "validation_failed", "Validation failed.", { fieldErrors, formErrors });
  }
}

export function fieldError(
  path: string,
  code: ValidationErrorCode,
  message: string,
): ValidationFieldError {
  return { path, code, message };
}

export function throwFields(...errors: ValidationFieldError[]): never {
  throw new ValidationFailed(errors.filter(Boolean));
}

export function requireString(body: Record<string, unknown>, path: string, max: number): string {
  const value = readPath(body, path);
  if (value == null || value === "") {
    throwFields(fieldError(path, "required", `${path} is required.`));
  }
  if (typeof value !== "string") {
    throwFields(fieldError(path, "invalid_type", `${path} must be a string.`));
  }
  const trimmed = value.trim();
  if (!trimmed) throwFields(fieldError(path, "required", `${path} is required.`));
  if (trimmed.length > max) {
    throwFields(fieldError(path, "too_long", `${path} must be at most ${max} characters.`));
  }
  return trimmed;
}

export function optionalString(
  body: Record<string, unknown>,
  path: string,
  max: number,
): string | undefined {
  if (!hasPath(body, path)) return undefined;
  const value = readPath(body, path);
  if (value === null) return undefined;
  if (typeof value !== "string") {
    throwFields(fieldError(path, "invalid_type", `${path} must be a string.`));
  }
  if (value.length > max) {
    throwFields(fieldError(path, "too_long", `${path} must be at most ${max} characters.`));
  }
  return value;
}

export function optionalNullableString(
  body: Record<string, unknown>,
  path: string,
): string | null | undefined {
  if (!hasPath(body, path)) return undefined;
  const value = readPath(body, path);
  if (value === null) return null;
  if (typeof value !== "string") {
    throwFields(fieldError(path, "invalid_type", `${path} must be a string or null.`));
  }
  return value;
}

export function moneyValue(
  body: Record<string, unknown>,
  path: string,
  required: boolean,
): string | null | undefined {
  if (!hasPath(body, path)) {
    if (required) throwFields(fieldError(path, "required", `${path} is required.`));
    return undefined;
  }
  const value = readPath(body, path);
  if (value === null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throwFields(fieldError(path, "out_of_range", `${path} must be a number ≥ 0 (whole pesos).`));
  }
  return n.toFixed(2);
}

export function intValue(
  body: Record<string, unknown>,
  path: string,
  min: number,
  max: number,
  required: boolean,
): number | null | undefined {
  if (!hasPath(body, path)) {
    if (required) throwFields(fieldError(path, "required", `${path} is required.`));
    return undefined;
  }
  const value = readPath(body, path);
  if (value === null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throwFields(
      fieldError(path, "out_of_range", `${path} must be an integer from ${min} to ${max}.`),
    );
  }
  return n;
}

export function requireEmail(body: Record<string, unknown>, path: string): string {
  const value = requireString(body, path, FIELD_CONSTRAINTS.settings["contact.email"].max);
  if (!EMAIL_FORMAT_RE.test(value)) {
    throwFields(fieldError(path, "invalid_format", `${path} must be an email address.`));
  }
  return value;
}

export function requirePhMobile(body: Record<string, unknown>, path: string): string {
  const value = requireString(body, path, 16);
  if (!isPhMobile(value)) {
    throwFields(
      fieldError(
        path,
        "invalid_format",
        `${path} must be a PH mobile number (09XXXXXXXXX or +639XXXXXXXXX).`,
      ),
    );
  }
  return value;
}

export function requirePolicyVersion(value: string, path = "version"): string {
  if (!isPolicyVersion(value)) {
    throwFields(fieldError(path, "invalid_format", `${path} must be YYYY-MM.`));
  }
  return value;
}

export function hasPath(body: Record<string, unknown>, path: string): boolean {
  const parts = path.split(".");
  let current: unknown = body;
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current) || !(part in current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return true;
}

export function readPath(body: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = body;
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export { FIELD_CONSTRAINTS };
