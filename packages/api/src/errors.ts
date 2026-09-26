import {
  EVENT_CONFLICT_CODES,
  EVENT_CONFLICT_MESSAGES,
  type ValidationFailedBody,
  type ValidationFieldError,
  type ValidationFormError,
} from "@balanse/domain";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  readonly details?: Record<string, unknown>;
  readonly fieldErrors?: ValidationFieldError[];
  readonly formErrors?: ValidationFormError[];

  constructor(
    status: number,
    code: string,
    message: string,
    options?: {
      fields?: Record<string, string>;
      details?: Record<string, unknown>;
      fieldErrors?: ValidationFieldError[];
      formErrors?: ValidationFormError[];
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = options?.fields;
    this.details = options?.details;
    this.fieldErrors = options?.fieldErrors;
    this.formErrors = options?.formErrors;
  }

  toValidationBody(): ValidationFailedBody | null {
    if (this.code !== "validation_failed" && this.status !== 422) return null;
    const fieldErrors =
      this.fieldErrors ??
      Object.entries(this.fields ?? {}).map(([path, message]) => ({
        path,
        code: "required" as const,
        message,
      }));
    return {
      error: "validation_failed",
      fieldErrors,
      formErrors: this.formErrors ?? [],
    };
  }
}

const RULE_CODES = new Set([
  "booking_cutoff_reached",
  "duplicate_active_reservation",
  "missing_required_policy_acceptance",
  "session_not_reservable",
  "capacity_exceeded",
  "target_session_full",
  "check_in_requires_confirmed",
  "completed_blocked_oq10",
  "illegal_booking_transition",
  "gcash_proof_required",
  "cash_does_not_use_proof",
  "request_not_open",
  "session_not_found",
  "booking_not_found",
  "refund_not_found",
  "no_show_requires_confirmed",
  "illegal_refund_transition",
  "target_session_required",
  "entitlement_not_found",
  "entitlement_foreign",
  "entitlement_revoked",
  "entitlement_expired",
  "entitlement_exhausted",
  "entitlement_ineligible_class",
  "entitlement_not_usable",
  "entitlement_snapshot_immutable",
  "redemption_conflict",
  "package_not_found",
  "package_not_free",
  "package_is_free",
  "acquisition_not_found",
  "last_super_admin_protected",
  "permission_denied",
  "privilege_escalation",
  "archived_role",
  "coach_role_requires_link",
  "unknown_permission",
  "event_not_found",
  "event_session_taken",
  "event_on_cancelled_session",
  "event_publish_requires_published_session",
]);

export function isLastSuperAdminProtectedError(error: unknown): boolean {
  if (error instanceof ApiError) return error.code === "last_super_admin_protected";
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("last_super_admin_protected");
}

function uniqueTargets(error: object): string {
  if (!("meta" in error)) return "";
  const target = (error as { meta?: { target?: unknown } }).meta?.target;
  if (Array.isArray(target)) return target.map(String).join(" ");
  return typeof target === "string" ? target : "";
}

export function mapUnknownError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  ) {
    const target = uniqueTargets(error);
    if (target.includes("sessionId")) {
      return new ApiError(409, "event_session_taken", EVENT_CONFLICT_MESSAGES.event_session_taken);
    }
    return new ApiError(409, "conflict", "A unique value is already in use.", {
      fieldErrors: [
        { path: "name", code: "duplicate_value", message: "This name is already used." },
      ],
    });
  }
  const message = error instanceof Error ? error.message : String(error);
  const eventConflict = EVENT_CONFLICT_CODES.find((code) => message.includes(code));
  if (eventConflict) {
    return new ApiError(409, eventConflict, EVENT_CONFLICT_MESSAGES[eventConflict]);
  }
  const codeMatch = message.match(/(?:P0001|P0002):\s*([a-z0-9_]+)|([a-z0-9_]+)(?::|\s|$)/i);
  const extracted = (codeMatch?.[1] ?? codeMatch?.[2] ?? "").toLowerCase();
  if (extracted.includes("booking_cutoff_reached") || message.includes("booking_cutoff_reached")) {
    return new ApiError(400, "booking_cutoff_reached", "Bookings are closed for this session.");
  }
  if (message.includes("below_confirmed_count")) {
    return new ApiError(
      409,
      "below_confirmed_count",
      "Capacity cannot drop below consumed bookings.",
      {
        fieldErrors: [
          {
            path: "capacity",
            code: "below_confirmed_count",
            message: "Capacity cannot drop below consumed bookings.",
          },
        ],
      },
    );
  }
  if (isLastSuperAdminProtectedError(error)) {
    return new ApiError(
      403,
      "last_super_admin_protected",
      "The last active Super Admin cannot be disabled, demoted, or stripped of all-access.",
    );
  }
  if (message.includes("permission_denied")) {
    return new ApiError(403, "forbidden", "Missing permission.");
  }
  for (const code of RULE_CODES) {
    if (message.includes(code)) {
      const status = code.endsWith("_not_found")
        ? 404
        : code === "last_super_admin_protected" ||
            code === "permission_denied" ||
            code === "privilege_escalation"
          ? 403
          : 400;
      return new ApiError(status, code, message);
    }
  }
  return new ApiError(500, "internal_error", "Unexpected server error.");
}
