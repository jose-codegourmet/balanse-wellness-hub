/**
 * Shared HTTP contracts for BE-050–BE-054 (admin queues, validation, uploads,
 * settings writes, dashboard metrics). FE mocks may adopt the same shapes.
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
  "duplicate_value",
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
    associatedCoachIds: { required: false, mayBeEmpty: true },
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
  },
  session: {
    classId: { required: true },
    coachId: { required: true, allowInactive: false },
    startsAt: { required: true },
    endsAt: { required: true, after: "startsAt" },
    maxDurationHours: 8,
    customerPrice: { required: true, min: 0, unit: MONEY_UNIT },
    capacity: { required: true, min: 1, max: 200, notBelowConsumed: true },
    bookable: { required: false, type: "boolean" },
    status: { required: false, enum: ["DRAFT", "PUBLISHED", "CANCELLED"] },
    coachRate: { required: false, adminOnly: true, snapshot: true },
    coachRateType: { required: false, adminOnly: true, snapshot: true },
  },
  settings: {
    businessName: { required: true, max: 80 },
    "contact.phone": { required: true, max: 32 },
    "contact.address": { required: true, max: 200 },
    "contact.email": { required: true, format: "email", max: 120 },
    gcashName: { required: true, max: 80 },
    gcashNumber: { required: true, format: "ph_mobile" },
    qrImageKey: { required: false, nullable: true },
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

export function isPhMobile(value: string): boolean {
  return PH_MOBILE_RE.test(value.trim());
}

export function isPolicyVersion(value: string): boolean {
  return POLICY_VERSION_RE.test(value.trim());
}
