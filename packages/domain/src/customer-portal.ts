import type { BookingStatus, PaymentMethod, PaymentStatus } from "./enums";
import { BOOKING_STATUSES } from "./enums";
import { effectiveHoldDeadline } from "./format";
import { bookingSurfaceLabel } from "./status-language";
import type { CustomerBooking, CustomerProfile } from "./types";

/** Developer-configured default (R29–R31). Never exposed as an editable UI control. */
export const HOLD_DURATION_HOURS = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * OQ-3 / Coach Rex: required profile fields are undecided. Customer sign-up and
 * profile implement exactly Full name, Email, and Contact number — no DOB,
 * emergency contact, or health declarations.
 */
export const PROFILE_FIELDS_NOTE =
  "OQ-3: only full name, email, and contact number. Do not add sensitive fields.";

/**
 * OQ-4: waiver/policy body copy is placeholder until legal text exists.
 * OQ-5: re-acceptance cadence is undecided; do not invent it.
 */
export const REQUIRED_POLICY_DOCUMENTS = [
  {
    documentName: "Waiver",
    version: "2026-01",
    placeholderNotice: "Placeholder text only — not legal waiver language (OQ-4).",
  },
  {
    documentName: "Gym Policy",
    version: "2026-01",
    placeholderNotice: "Placeholder text only — not studio policy language (OQ-4).",
  },
] as const;

/** Known mock emails for FE-CUS-001. Passwords are not real credentials. */
export const MOCK_CUSTOMER_CREDENTIALS = [
  { email: "ana@example.com", password: "welcome", customerId: "cust-ana" },
  { email: "ben@example.com", password: "welcome", customerId: "cust-ben" },
] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  GCASH: "GCash",
  PAY_AT_COUNTER: "Pay at Counter",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NONE: "Not started",
  PROOF_SUBMITTED: "Proof submitted",
  CASH_RECEIVED: "Cash received",
  VERIFIED: "Verified",
  REJECTED: "Payment not accepted",
};

export function paymentMethodLabel(method: PaymentMethod | null): string {
  if (!method) return "Not selected";
  return PAYMENT_METHOD_LABELS[method];
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}

export function computeHoldExpiresAt(
  reservedAt: string | Date,
  classStartsAt: string | Date,
): Date {
  const reserved = typeof reservedAt === "string" ? new Date(reservedAt) : reservedAt;
  const uncapped = new Date(reserved.getTime() + HOLD_DURATION_HOURS * 60 * 60 * 1000);
  return effectiveHoldDeadline(uncapped, classStartsAt);
}

export function isHoldExpired(
  holdExpiresAt: string | Date | null,
  classStartsAt: string | Date,
  now: string | Date,
): boolean {
  if (!holdExpiresAt) return false;
  const deadline = effectiveHoldDeadline(holdExpiresAt, classStartsAt);
  const current = typeof now === "string" ? new Date(now) : now;
  return deadline.getTime() <= current.getTime();
}

/**
 * OQ-9: reference format is undecided. Render a plain-text code derived from
 * the booking id. Do not ship a QR code.
 */
export function bookingReference(bookingId: string): string {
  const slug = bookingId
    .replace(/^booking-/, "")
    .replace(/_/g, "-")
    .toUpperCase();
  return `BWH-${slug}`;
}

export type BookingListTab = "upcoming" | "pending" | "history";

export function bookingListTab(status: BookingStatus): BookingListTab {
  switch (status) {
    case "CONFIRMED":
    case "CHECKED_IN":
      return "upcoming";
    case "COMPLETED":
    case "CANCELLED":
    case "REJECTED":
    case "EXPIRED":
    case "NO_SHOW":
      return "history";
    default:
      return "pending";
  }
}

export type NeedsAttentionKind = "payment_needed" | "payment_under_review" | "request_pending";

export function needsAttentionKind(status: BookingStatus): NeedsAttentionKind | null {
  if (status === "HELD_AWAITING_PAYMENT") return "payment_needed";
  if (status === "PAYMENT_SUBMITTED") return "payment_under_review";
  if (status === "CANCELLATION_REQUESTED" || status === "RESCHEDULE_REQUESTED") {
    return "request_pending";
  }
  return null;
}

export function customerBookingActions(status: BookingStatus): {
  reschedule: boolean;
  cancel: boolean;
} {
  switch (status) {
    case "CONFIRMED":
    case "HELD_AWAITING_PAYMENT":
    case "PAYMENT_SUBMITTED":
      return { reschedule: true, cancel: true };
    case "WAITLISTED":
    case "RESCHEDULE_REQUESTED":
      return { reschedule: false, cancel: true };
    default:
      return { reschedule: false, cancel: false };
  }
}

export function upcomingConfirmed(bookings: CustomerBooking[]): CustomerBooking | null {
  return bookings.find((booking) => booking.status === "CONFIRMED") ?? null;
}

export function needsAttentionBookings(bookings: CustomerBooking[]): CustomerBooking[] {
  return bookings.filter((booking) => needsAttentionKind(booking.status) !== null);
}

export function bookingsForTab(
  bookings: CustomerBooking[],
  tab: BookingListTab,
): CustomerBooking[] {
  return bookings.filter((booking) => bookingListTab(booking.status) === tab);
}

export function allBookingStatusesPresentable(): BookingStatus[] {
  return [...BOOKING_STATUSES];
}

export function presentableStatusCopy(booking: CustomerBooking): string {
  return bookingSurfaceLabel(booking);
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type LoginInput = { email: string; password: string };

export function validateCustomerLogin(
  input: LoginInput,
):
  | { ok: false; errors: FieldErrors<"email" | "password" | "form"> }
  | { ok: true; customerId: string } {
  const errors: FieldErrors<"email" | "password" | "form"> = {};
  if (!input.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email.";
  if (!input.password) errors.password = "Password is required.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const match = MOCK_CUSTOMER_CREDENTIALS.find(
    (row) =>
      row.email.toLowerCase() === input.email.trim().toLowerCase() &&
      row.password === input.password,
  );
  if (!match) {
    return { ok: false, errors: { form: "Those credentials are not recognised in this mock." } };
  }
  return { ok: true, customerId: match.customerId };
}

export type SignUpInput = {
  fullName: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
};

export function validateCustomerSignUp(
  input: SignUpInput,
): { ok: false; errors: FieldErrors<keyof SignUpInput> } | { ok: true } {
  const errors: FieldErrors<keyof SignUpInput> = {};
  if (!input.fullName.trim()) errors.fullName = "Full name is required.";
  if (!input.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email.";
  if (!input.contactNumber.trim()) errors.contactNumber = "Contact number is required.";
  if (!input.password) errors.password = "Password is required.";
  else if (input.password.length < 8) errors.password = "Use at least 8 characters.";
  if (!input.confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

export function validateForgotPasswordEmail(
  email: string,
): { ok: false; error: string } | { ok: true } {
  if (!email.trim()) return { ok: false, error: "Email is required." };
  if (!EMAIL_RE.test(email.trim())) return { ok: false, error: "Enter a valid email." };
  return { ok: true };
}

export type ProfileInput = Pick<CustomerProfile, "fullName" | "email" | "contactNumber">;

export function validateCustomerProfile(
  input: ProfileInput,
): { ok: false; errors: FieldErrors<keyof ProfileInput> } | { ok: true } {
  const errors: FieldErrors<keyof ProfileInput> = {};
  if (!input.fullName.trim()) errors.fullName = "Full name is required.";
  if (!input.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email.";
  if (!input.contactNumber.trim()) errors.contactNumber = "Contact number is required.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

export function safeAppPath(returnTo: string | null | undefined, fallback = "/portal"): string {
  if (!returnTo) return fallback;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  return returnTo;
}

export function customerAuthMethodLabel(method: CustomerProfile["authMethod"]): string {
  return method === "google" ? "Google" : "Email and password";
}

/** Up to two initials for the avatar treatment shared by the profile and the sidebar. */
export function customerInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type CustomerAuthMethodCopy = {
  /** Provider identity for the connected-account row. */
  provider: string;
  /** What the connection currently gives the customer. */
  summary: string;
  /** Why the manage/disconnect control does nothing (FE-CUS-017 mock phase). */
  mockNote: string;
  /** How password changes behave for this sign-in method. */
  passwordNote: string;
};

/**
 * Account and password copy for the profile settings sections. Kept beside the
 * label so the mock-phase wording stays reviewable in one place and never
 * claims a credential or a linked account actually changed.
 */
export const CUSTOMER_AUTH_METHOD_COPY: Record<
  CustomerProfile["authMethod"],
  CustomerAuthMethodCopy
> = {
  google: {
    provider: "Google",
    summary: "You sign in with your Google account.",
    mockNote: "Mock only — nothing is linked or disconnected in this preview.",
    passwordNote:
      "Your password lives in your Google account, so there is nothing to change here. Update it from Google if you need to.",
  },
  email: {
    provider: "Email and password",
    summary: "You sign in with your email address and a password.",
    mockNote: "Mock only — sign-in methods are not connected in this preview.",
    passwordNote: "Choose a new password. Nothing real is stored in this preview.",
  },
};

export function customerAuthMethodCopy(
  method: CustomerProfile["authMethod"],
): CustomerAuthMethodCopy {
  return CUSTOMER_AUTH_METHOD_COPY[method];
}

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * Client-side rules for the mock change-password form. There is no credential
 * to check the current password against, so it is only required, never verified.
 */
export function validateMockPasswordChange(
  input: PasswordChangeInput,
): { ok: false; errors: FieldErrors<keyof PasswordChangeInput> } | { ok: true } {
  const errors: FieldErrors<keyof PasswordChangeInput> = {};
  if (!input.currentPassword) errors.currentPassword = "Enter your current password.";
  if (!input.newPassword) errors.newPassword = "New password is required.";
  else if (input.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (input.newPassword === input.currentPassword) {
    errors.newPassword = "Choose a password you are not already using.";
  }
  if (!input.confirmPassword) errors.confirmPassword = "Confirm your new password.";
  else if (input.newPassword !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}
