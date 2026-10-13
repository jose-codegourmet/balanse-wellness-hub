import type { ValidationFieldError, ValidationFormError } from "@balanse/domain";

export type ApiErrorBody = {
  code: string;
  message: string;
  error?: "validation_failed";
  fields?: Record<string, string>;
  fieldErrors?: ValidationFieldError[];
  formErrors?: ValidationFormError[];
  details?: unknown;
};

/** Thrown by `apiFetch*` for any non-2xx `/api/*` response (WIRE-0101/0102, #356). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  readonly fieldErrors?: ValidationFieldError[];
  readonly formErrors?: ValidationFormError[];
  readonly details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
    this.fieldErrors = body.fieldErrors;
    this.formErrors = body.formErrors;
    this.details = body.details;
  }

  get isValidationFailed(): boolean {
    return this.status === 422 || this.code === "validation_failed";
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }
}

/** Builds an `ApiError` from a non-ok `fetch` Response (handles a non-JSON body). */
export async function errorFromResponse(response: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> = {};
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as Partial<ApiErrorBody>;
    }
  } catch {
    // Non-JSON error body (network failure, HTML error page, etc.) — fall back below.
  }
  return new ApiError(response.status, {
    code: body.code ?? "unknown_error",
    message: body.message ?? response.statusText ?? "Request failed.",
    error: body.error,
    fields: body.fields,
    fieldErrors: body.fieldErrors,
    formErrors: body.formErrors,
    details: body.details,
  });
}
