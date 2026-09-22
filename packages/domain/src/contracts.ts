/**
 * Shared HTTP contracts for BE-050–BE-056 (admin queues, validation, uploads,
 * settings writes, dashboard metrics, staff/coach link, payment QR collection).
 * FE mocks may adopt the same shapes.
 */

/** One envelope for every paginated admin list (BE-050). */
export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
};

export const ADMIN_CURSOR_LIMIT_DEFAULT = 20;
export const ADMIN_CURSOR_LIMIT_MAX = 50;
export const ADMIN_BOOKINGS_CURSOR_LIMIT_DEFAULT = 8;

export type AdminQueueTab = "payments" | "cancellations" | "reschedules" | "bookings";

export type AdminPaymentQueueTab = "gcash" | "counter" | "refunds";

export const ADMIN_PAYMENT_QUEUE_TABS = ["gcash", "counter", "refunds"] as const;

/** Opaque cursor is unsigned base64url JSON — not HMAC-signed (no extra secret). */
export const ADMIN_CURSOR_SIGNING = "unsigned_base64url_v1" as const;

export type ValidationFieldError = {
  path: string;
  code: ValidationErrorCode;
  message: string;
};

export type ValidationFormError = {
  code: ValidationErrorCode;
  message: string;
};

/** 422 body for every admin write that fails field or form rules (BE-051). */
export type ValidationFailedBody = {
  error: "validation_failed";
  fieldErrors: ValidationFieldError[];
  formErrors: ValidationFormError[];
};

export const VALIDATION_ERROR_CODES = [
  "required",
  "too_short",
  "too_long",
  "out_of_range",
  "invalid_format",
  "invalid_enum",
  "invalid_type",
  "ends_before_start",
  "below_confirmed_count",
  "duration_too_long",
  "inactive_reference",
  "read_only",
  "unknown_section",
  "faq_limit",
  "qr_limit",
  "already_linked",
  "cannot_remove_active",
  "duplicate_value",
  "already_exists",
  "developer_config_forbidden",
] as const;

export type ValidationErrorCode = (typeof VALIDATION_ERROR_CODES)[number];

/** Whole pesos as decimal strings (`"1500.00"`). Not centavos. Integers are accepted and coerced. */
export const MONEY_UNIT = "php_decimal" as const;

export const CONTENT_STORAGE_FORMAT = {
  flavour: "commonmark",
  allowed: ["paragraph", "emphasis", "strong", "link", "ordered_list", "unordered_list"],
  sanitisation: "render_time",
} as const;

export const FIELD_CONSTRAINTS = {
  class: {
    name: { required: true, max: 80, unique: true },
    shortDescription: { required: true, max: 500, format: "markdown" },
    defaultDurationMinutes: { required: false, min: 1, max: 240 },
    defaultCustomerPrice: { required: false, min: 0, unit: MONEY_UNIT },
    active: { required: false, type: "boolean" },
  },
  coach: {
    name: { required: true, max: 80 },
    specialties: {
      required: false,
      vocabulary: "free_text",
      maxItems: 12,
      itemMax: 40,
    },
    shortBio: { required: true, max: 1000, format: "markdown" },
    photoKey: { required: false, nullable: true },
    active: { required: false, type: "boolean" },
    defaultRate: { required: true, min: 0, unit: MONEY_UNIT, adminOnly: true },
    rateType: { required: true, enum: ["PER_SESSION", "PER_HOUR"], adminOnly: true },
    staffId: { required: false, nullable: true, derivedFrom: "staffMemberId" },
  },
  staff: {
    name: { required: true, max: 80 },
    email: { required: true, format: "email" },
    coachId: { required: false, nullable: true },
    isCoach: { readOnly: true, derivedFrom: "coach" },
  },
  session: {
    classId: { required: true },
    coachIds: { required: true, minItems: 1, unique: true, allowInactive: false },
    startsAt: { required: true },
    endsAt: { required: true, after: "startsAt" },
    maxDurationHours: 8,
    customerPrice: { required: true, min: 0, unit: MONEY_UNIT },
    capacity: { required: true, min: 1, max: 200, notBelowConsumed: true },
    bookable: { required: false, type: "boolean" },
    status: { required: false, enum: ["DRAFT", "PUBLISHED", "CANCELLED"] },
    coachAssignments: { adminOnly: true, readOnly: true, snapshot: true },
  },
  bundle: {
    name: { required: true, max: 80 },
    slug: { required: true, max: 80, unique: true },
    summary: { required: true, max: 200 },
    description: { required: true, max: 4000, format: "markdown" },
    sessionCredits: { required: true, min: 1, max: 365 },
    pricePhp: { required: true, min: 0, unit: MONEY_UNIT },
    validityDays: { required: false, min: 1, max: 730 },
    perCustomerLimit: { required: false, min: 1, max: 20 },
    status: { required: true, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
  },
  settings: {
    businessName: { required: true, max: 80 },
    "contact.phone": { required: true, max: 32 },
    "contact.address": { required: true, max: 200 },
    "contact.email": { required: true, format: "email", max: 120 },
    gcashName: { required: true, max: 80 },
    gcashNumber: { required: true, format: "ph_mobile" },
    qrImageKey: { required: false, nullable: true, readOnly: true, derived: true },
    paymentQr: {
      label: { required: true, max: 80 },
      imageKey: { required: true },
      maxItems: 12,
    },
    about: { required: true, max: 4000, format: "markdown" },
    openingHours: { readOnly: true },
    policyVersion: { format: "yyyy-mm" },
    faq: {
      maxItems: 20,
      question: { required: true, max: 160 },
      answer: { required: true, max: 2000, format: "markdown" },
    },
  },
} as const;

export const PH_MOBILE_RE = /^(09|\+639)\d{9}$/;
/** Type-in mask for PH mobile numbers. */
export const PH_MOBILE_PLACEHOLDER = "09XX XXX XXXX";
export const PH_MOBILE_ERROR = "Enter a PH mobile number.";
export const POLICY_VERSION_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
export const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SIGNED_UPLOAD = {
  expiresSeconds: 15 * 60,
  maxBytes: 5 * 1024 * 1024,
  coachPhotoTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  gcashQrTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  orphanReapAfterHours: 24,
} as const;

export type SignedUploadIntent = {
  upload: { signedUrl: string; token: string; path: string; expiresIn: number };
  objectKey: string;
  bucket: "coach-photos" | "marketing-assets";
  maxBytes: number;
  contentTypes: string[];
};

export type SettingsSection = "business" | "payment" | "content" | "policies";

export const SETTINGS_SECTIONS = ["business", "payment", "content", "policies"] as const;

export type DashboardMetricId = "gross_sales" | "occupancy" | "session_count" | "coach_cost";

export type MetricPoint = { date: string; value: number };

export type MetricSeries = {
  metric: DashboardMetricId;
  grain: "day";
  timezone: "Asia/Manila";
  windowDays: number;
  points: MetricPoint[];
};

export const DASHBOARD_SERIES_WINDOW_DAYS = 14;

export type MetricComparison = {
  current: number;
  prior: number | null;
  priorWindow: "previous_manila_day" | null;
};

export type AdminQueueRow = {
  id: string;
  customerName: string;
};

/** Strip spacing and punctuation to `09XXXXXXXXX` or `+639XXXXXXXXX`. */
export function compactPhMobile(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  return trimmed.replace(/\D/g, "");
}

export function isPhMobile(value: string): boolean {
  return PH_MOBILE_RE.test(compactPhMobile(value));
}

/**
 * Mask a typed or pasted value as `09XX XXX XXXX`.
 * Accepts `09…`, `9…`, `+63 9…`, and `63 9…`; rejects other country codes.
 */
export function maskPhMobileInput(raw: string): string {
  if (!raw.trim()) return "";
  const digits = raw.replace(/\D/g, "");
  let national = digits.startsWith("63")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  if (national && national[0] !== "9") {
    national = national.replace(/^[^9]+/, "");
  }
  national = national.slice(0, 10);
  if (!national) {
    return digits.startsWith("0") || raw.trim().startsWith("0") ? "0" : "";
  }
  const local = `0${national}`;
  if (local.length <= 4) return local;
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function isPolicyVersion(value: string): boolean {
  return POLICY_VERSION_RE.test(value.trim());
}
