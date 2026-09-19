export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    options?: { fields?: Record<string, string>; details?: Record<string, unknown> },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = options?.fields;
    this.details = options?.details;
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
]);

export function mapUnknownError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const codeMatch = message.match(/(?:P0001|P0002):\s*([a-z0-9_]+)|([a-z0-9_]+)(?::|\s|$)/i);
  const extracted = (codeMatch?.[1] ?? codeMatch?.[2] ?? "").toLowerCase();
  if (extracted.includes("booking_cutoff_reached") || message.includes("booking_cutoff_reached")) {
    return new ApiError(400, "booking_cutoff_reached", "Bookings are closed for this session.");
  }
  for (const code of RULE_CODES) {
    if (message.includes(code)) {
      const status = code.endsWith("_not_found") ? 404 : 400;
      return new ApiError(status, code, message);
    }
  }
  return new ApiError(500, "internal_error", "Unexpected server error.");
}
