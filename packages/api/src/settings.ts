import { CONTACT_DETAILS } from "@balanse/domain";
import type { ApiDeps } from "./deps";
import { ApiError } from "./errors";

export const SETTINGS_META_KEY = "public_settings";

export const DEFAULT_SETTINGS = {
  business: {
    name: "Balanse Wellness Hub",
    phone: CONTACT_DETAILS.phone,
    email: CONTACT_DETAILS.email,
    address: CONTACT_DETAILS.address,
    instagram: CONTACT_DETAILS.instagram,
    tiktok: CONTACT_DETAILS.tiktok,
    whatsapp: CONTACT_DETAILS.whatsapp,
    openingHours: "",
  },
  payment: {
    gcashAccountName: "",
    gcashNumber: "",
    gcashQrObjectKey: "",
    gcashQrPublicUrl: "",
  },
  content: {
    about: "",
    contact: "",
    faqs: [] as Array<{ question: string; answer: string }>,
  },
} as const;

export type SettingsPayload = {
  business: {
    name: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    openingHours: string;
  };
  payment: {
    gcashAccountName: string;
    gcashNumber: string;
    gcashQrObjectKey: string;
    gcashQrPublicUrl: string;
  };
  content: {
    about: string;
    contact: string;
    faqs: Array<{ question: string; answer: string }>;
  };
};

const FORBIDDEN_SETTING_KEYS = [
  "hold",
  "cutoff",
  "BOOKING_HOLD_DURATION_HOURS",
  "BOOKING_CUTOFF_MINUTES_BEFORE_START",
  "holdDuration",
  "bookingCutoff",
];

export function assertNoDeveloperConfig(payload: unknown): void {
  const raw = JSON.stringify(payload);
  for (const key of FORBIDDEN_SETTING_KEYS) {
    if (raw.includes(key)) {
      throw new ApiError(
        400,
        "developer_config_forbidden",
        "Reservation hold duration and booking cutoff are not admin settings.",
      );
    }
  }
}

export function mergeSettings(stored: unknown): SettingsPayload {
  const incoming = stored && typeof stored === "object" ? (stored as Partial<SettingsPayload>) : {};
  return {
    business: { ...DEFAULT_SETTINGS.business, ...incoming.business },
    payment: { ...DEFAULT_SETTINGS.payment, ...incoming.payment },
    content: {
      ...DEFAULT_SETTINGS.content,
      ...incoming.content,
      faqs: incoming.content?.faqs ?? [...DEFAULT_SETTINGS.content.faqs],
    },
  };
}

export async function readSettings(deps: ApiDeps): Promise<SettingsPayload> {
  const row = await deps.prisma.appMeta.findUnique({ where: { key: SETTINGS_META_KEY } });
  if (!row) return mergeSettings(DEFAULT_SETTINGS);
  try {
    return mergeSettings(JSON.parse(row.value));
  } catch {
    return mergeSettings(DEFAULT_SETTINGS);
  }
}

export async function writeSettings(
  deps: ApiDeps,
  next: SettingsPayload,
): Promise<SettingsPayload> {
  assertNoDeveloperConfig(next);
  await deps.prisma.appMeta.upsert({
    where: { key: SETTINGS_META_KEY },
    create: { key: SETTINGS_META_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  });
  return next;
}

export const CANCELLATION_NOTICE =
  "This request is reviewed manually. Any applicable refund is processed manually and is not automatic.";

export const OQ2_UNENFORCED_RULES = [
  "Target session class type is not validated (OQ-2).",
  "Price difference is not computed or charged (OQ-2).",
  "Target session cutoff is not validated on the customer request (OQ-2).",
  "Reschedule-count limits are not enforced (OQ-2).",
] as const;

export const PROOF_REUPLOAD_POLICY =
  "Re-upload replaces the active payment.proofObjectKey. Prior keys and timestamps remain in audit_events (payment.proof.replace). History is retained; proofs are not appended as extra payment rows.";

export const CUSTOMER_SENSITIVE_READ_POLICY =
  "Admin customer list/detail is operational-only (profile, bookings, requests, attendance, payments, policy versions). Each detail GET writes audit_events action customer.read.";

export const REPORTS_PERFORMANCE_BUDGET =
  "Required date range is validated and capped at 366 days. Session-performance rows are paginated (page/pageSize, max 100). Aggregates are SQL functions from BE-022.";
