import type { BookingStatus } from "./enums";
import { CUSTOMER_STATUS_LABELS } from "./status-language";

/**
 * Transient confirmation copy for the customer portal and the one public
 * surface that submits something (FE-SHR-006).
 *
 * Lives beside the status labels so the wording stays reviewable in one place.
 * The vocabulary is deliberately small: a held booking, a chosen payment
 * method, and a submitted proof are *not* confirmations, so only outcomes the
 * studio has actually completed use the `success` tone.
 */

export const PORTAL_TOAST_TONES = ["success", "info", "warning", "error", "loading"] as const;

export type PortalToastTone = (typeof PORTAL_TOAST_TONES)[number];

export const PORTAL_TOAST_IDS = [
  "booking.reserved",
  "booking.held-awaiting-payment",
  "booking.waitlisted",
  "payment.gcash-selected",
  "payment.counter-selected",
  "payment.proof-submitted",
  "payment.proof-failed",
  "reschedule.submitted",
  "cancellation.submitted",
  "cancellation.failed",
  "profile.saved",
  "profile.save-failed",
  "contact.message-sent",
  "contact.message-failed",
] as const;

export type PortalToastId = (typeof PORTAL_TOAST_IDS)[number];

export type PortalToastCopy = {
  id: PortalToastId;
  tone: PortalToastTone;
  title: string;
  /** Always duplicates state that is also rendered on the destination screen. */
  description: string;
};

type ExhaustivePortalToastCopy = { [K in PortalToastId]: PortalToastCopy };

export const PORTAL_TOAST_COPY = {
  "booking.reserved": {
    id: "booking.reserved",
    tone: "success",
    title: "Spot reserved",
    description: "Your reservation is recorded. Track it any time under My Bookings.",
  },
  "booking.held-awaiting-payment": {
    id: "booking.held-awaiting-payment",
    tone: "info",
    title: CUSTOMER_STATUS_LABELS.HELD_AWAITING_PAYMENT,
    description: "Your spot is held, not confirmed yet. Choose a payment method to keep it.",
  },
  "booking.waitlisted": {
    id: "booking.waitlisted",
    tone: "info",
    title: CUSTOMER_STATUS_LABELS.WAITLISTED,
    description: "You are on the waitlist. The studio reaches out if a spot opens up.",
  },
  "payment.gcash-selected": {
    id: "payment.gcash-selected",
    tone: "info",
    title: "GCash selected",
    description: "Send the session amount, then upload your screenshot as proof.",
  },
  "payment.counter-selected": {
    id: "payment.counter-selected",
    tone: "info",
    title: "Pay at Counter selected",
    description: "Settle at the front desk. Your spot stays held until the studio marks it paid.",
  },
  "payment.proof-submitted": {
    id: "payment.proof-submitted",
    tone: "info",
    title: CUSTOMER_STATUS_LABELS.PAYMENT_SUBMITTED,
    description: "The studio has your screenshot. Uploading proof does not confirm the booking.",
  },
  "payment.proof-failed": {
    id: "payment.proof-failed",
    tone: "error",
    title: "Proof upload failed",
    description: "We could not save that image. Check the file and try again.",
  },
  "reschedule.submitted": {
    id: "reschedule.submitted",
    tone: "info",
    title: CUSTOMER_STATUS_LABELS.RESCHEDULE_REQUESTED,
    description: "The studio reviews the request manually. Your current slot stays held.",
  },
  "cancellation.submitted": {
    id: "cancellation.submitted",
    tone: "info",
    title: CUSTOMER_STATUS_LABELS.CANCELLATION_REQUESTED,
    description: "The studio reviews the request manually, and any refund is manual too.",
  },
  "cancellation.failed": {
    id: "cancellation.failed",
    tone: "error",
    title: "Request not saved",
    description: "The cancellation request could not be saved. Try again.",
  },
  "profile.saved": {
    id: "profile.saved",
    tone: "success",
    title: "Profile saved",
    description: "Booking forms will use these details from now on.",
  },
  "profile.save-failed": {
    id: "profile.save-failed",
    tone: "error",
    title: "Profile not saved",
    description: "Your changes could not be saved. Try again.",
  },
  /** The contact form reaches the studio with a question — it books nothing. */
  "contact.message-sent": {
    id: "contact.message-sent",
    tone: "info",
    title: "Message recorded",
    description: "The studio has your question. This does not reserve a class.",
  },
  "contact.message-failed": {
    id: "contact.message-failed",
    tone: "error",
    title: "Message not saved",
    description: "That message could not be saved. Try again, or call the studio.",
  },
} as const satisfies ExhaustivePortalToastCopy;

export function portalToastCopy(id: PortalToastId): PortalToastCopy {
  return PORTAL_TOAST_COPY[id];
}

/**
 * Maps the status a freshly created booking lands on to its confirmation copy.
 * Statuses the customer can never reach straight from the booking form fall
 * back to the plain reserved wording rather than inventing a claim.
 */
export function bookingCreatedToastId(status: BookingStatus): PortalToastId {
  if (status === "WAITLISTED") return "booking.waitlisted";
  if (status === "HELD_AWAITING_PAYMENT") return "booking.held-awaiting-payment";
  return "booking.reserved";
}

/**
 * Admin write confirmations (FE-ADM-019). Reuses `PortalToastTone` — do not
 * fork a second tone vocabulary. Form-kit and queue tickets append their own ids.
 */
export const ADMIN_TOAST_IDS = [
  "class.saved",
  "class.save-failed",
  "coach.saved",
  "coach.save-failed",
  "form.validation-failed",
  "cancellation.completed",
  "cancellation.rejected",
  "cancellation.action-failed",
  "refund.status-updated",
  "refund.action-failed",
] as const;

export type AdminToastId = (typeof ADMIN_TOAST_IDS)[number];

export type AdminToastCopy = {
  id: AdminToastId;
  tone: PortalToastTone;
  title: string;
  description: string;
};

type ExhaustiveAdminToastCopy = { [K in AdminToastId]: AdminToastCopy };

export const ADMIN_TOAST_COPY = {
  "class.saved": {
    id: "class.saved",
    tone: "success",
    title: "Class saved",
    description: "The class list is updated.",
  },
  "class.save-failed": {
    id: "class.save-failed",
    tone: "error",
    title: "Class not saved",
    description: "Those changes could not be saved. Try again.",
  },
  "coach.saved": {
    id: "coach.saved",
    tone: "success",
    title: "Coach saved",
    description: "The coach list is updated. Existing session rate snapshots stay as they were.",
  },
  "coach.save-failed": {
    id: "coach.save-failed",
    tone: "error",
    title: "Coach not saved",
    description: "Those changes could not be saved. Try again.",
  },
  "form.validation-failed": {
    id: "form.validation-failed",
    tone: "error",
    title: "Check the form",
    description: "Fix the highlighted fields and try again.",
  },
  "cancellation.completed": {
    id: "cancellation.completed",
    tone: "success",
    title: "Cancellation completed",
    description: "The slot is released. The waitlist may be promoted.",
  },
  "cancellation.rejected": {
    id: "cancellation.rejected",
    tone: "success",
    title: "Request rejected",
    description: "The booking stays in place. The customer can see your reason.",
  },
  "cancellation.action-failed": {
    id: "cancellation.action-failed",
    tone: "error",
    title: "Cancellation not updated",
    description: "That request could not be updated. Try again.",
  },
  "refund.status-updated": {
    id: "refund.status-updated",
    tone: "success",
    title: "Refund status recorded",
    description: "Money still moves outside the app. This only records the status.",
  },
  "refund.action-failed": {
    id: "refund.action-failed",
    tone: "error",
    title: "Refund status not saved",
    description: "The refund status could not be recorded. Try again.",
  },
} as const satisfies ExhaustiveAdminToastCopy;

export function adminToastCopy(id: AdminToastId): AdminToastCopy {
  return ADMIN_TOAST_COPY[id];
}
