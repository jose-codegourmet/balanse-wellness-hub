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
  "package.claimed",
  "package.requested",
  "package.action-failed",
  "package.limit-reached",
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
  "package.claimed": {
    id: "package.claimed",
    tone: "success",
    title: "Package added",
    description: "Sessions remaining are ready to use on eligible classes. This is not cash.",
  },
  "package.requested": {
    id: "package.requested",
    tone: "info",
    title: "Package request sent",
    description: "The studio reviews paid packages manually. Credits activate after approval.",
  },
  "package.action-failed": {
    id: "package.action-failed",
    tone: "error",
    title: "Package not updated",
    description: "That package request could not be completed. Try again.",
  },
  "package.limit-reached": {
    id: "package.limit-reached",
    tone: "warning",
    title: "Package limit reached",
    description:
      "This package already belongs to your account. Ask the studio if you need another.",
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
  if (status === "PAYMENT_SUBMITTED") return "booking.reserved";
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
  "staff.saved",
  "staff.save-failed",
  "staff.disabled",
  "staff.disable-failed",
  "role.saved",
  "role.save-failed",
  "role.archived",
  "role.archive-failed",
  "form.validation-failed",
  "cancellation.completed",
  "cancellation.rejected",
  "cancellation.action-failed",
  "refund.status-updated",
  "refund.action-failed",
  "payment.confirmed",
  "payment.rejected",
  "payment.cash-recorded",
  "payment.action-failed",
  "booking.checked-in",
  "booking.check-in-failed",
  "reschedule.approved",
  "reschedule.rejected",
  "reschedule.action-failed",
  "session.saved",
  "session.save-failed",
  "session.cancelled",
  "session.cancel-failed",
  "settings.saved",
  "settings.save-failed",
  "policy.promoted",
  "policy.promote-failed",
  "bundle.saved",
  "bundle.save-failed",
  "bundle.status-updated",
  "bundle.status-failed",
  "bundle.granted",
  "bundle.grant-failed",
  "bundle.revoked",
  "bundle.acquisition-reviewed",
  "bundle.review-failed",
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
  "staff.saved": {
    id: "staff.saved",
    tone: "success",
    title: "Staff saved",
    description: "The staff list is updated. Coach profiles stay in history when unlinked.",
  },
  "staff.save-failed": {
    id: "staff.save-failed",
    tone: "error",
    title: "Staff not saved",
    description: "Those changes could not be saved. Try again.",
  },
  "staff.disabled": {
    id: "staff.disabled",
    tone: "success",
    title: "Staff access disabled",
    description:
      "This account cannot reach the admin portal. Linked coaches go inactive; sessions stay assigned.",
  },
  "staff.disable-failed": {
    id: "staff.disable-failed",
    tone: "error",
    title: "Staff not disabled",
    description: "Access could not be disabled. Try again.",
  },
  "role.saved": {
    id: "role.saved",
    tone: "success",
    title: "Role saved",
    description: "The role catalogue is updated. Assigned staff keep this permission set.",
  },
  "role.save-failed": {
    id: "role.save-failed",
    tone: "error",
    title: "Role not saved",
    description: "Those role changes could not be saved. Try again.",
  },
  "role.archived": {
    id: "role.archived",
    tone: "success",
    title: "Role archived",
    description: "Archived roles cannot be assigned. Existing history stays in the catalogue.",
  },
  "role.archive-failed": {
    id: "role.archive-failed",
    tone: "error",
    title: "Role not archived",
    description: "Assigned or built-in roles cannot be archived.",
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
  "payment.confirmed": {
    id: "payment.confirmed",
    tone: "success",
    title: "Payment confirmed",
    description: "The booking is confirmed. The customer can see the updated status.",
  },
  "payment.rejected": {
    id: "payment.rejected",
    tone: "success",
    title: "Payment rejected",
    description: "The hold is released. The customer can see your reason.",
  },
  "payment.cash-recorded": {
    id: "payment.cash-recorded",
    tone: "success",
    title: "Cash recorded",
    description: "Payment is marked received. Confirm the booking when you are ready.",
  },
  "payment.action-failed": {
    id: "payment.action-failed",
    tone: "error",
    title: "Payment not updated",
    description: "That payment could not be updated. Try again.",
  },
  "booking.checked-in": {
    id: "booking.checked-in",
    tone: "success",
    title: "Guest checked in",
    description: "Attendance is recorded for this booking.",
  },
  "booking.check-in-failed": {
    id: "booking.check-in-failed",
    tone: "error",
    title: "Check-in not saved",
    description: "The guest could not be checked in. Try again.",
  },
  "reschedule.approved": {
    id: "reschedule.approved",
    tone: "success",
    title: "Booking moved",
    description: "The original booking history is preserved on the new session.",
  },
  "reschedule.rejected": {
    id: "reschedule.rejected",
    tone: "success",
    title: "Request rejected",
    description: "The booking stays on the original session. The customer can see your reason.",
  },
  "reschedule.action-failed": {
    id: "reschedule.action-failed",
    tone: "error",
    title: "Reschedule not updated",
    description: "That request could not be updated. Try again.",
  },
  "session.saved": {
    id: "session.saved",
    tone: "success",
    title: "Session saved",
    description: "The schedule is updated.",
  },
  "session.save-failed": {
    id: "session.save-failed",
    tone: "error",
    title: "Session not saved",
    description: "Those changes could not be saved. Try again.",
  },
  "session.cancelled": {
    id: "session.cancelled",
    tone: "success",
    title: "Session cancelled",
    description: "Affected bookings enter manual refund handling. The session stays in history.",
  },
  "session.cancel-failed": {
    id: "session.cancel-failed",
    tone: "error",
    title: "Session not cancelled",
    description: "That session could not be cancelled. Try again.",
  },
  "settings.saved": {
    id: "settings.saved",
    tone: "success",
    title: "Settings saved",
    description: "Only this section was updated. Other settings are unchanged.",
  },
  "settings.save-failed": {
    id: "settings.save-failed",
    tone: "error",
    title: "Settings not saved",
    description: "Those changes could not be saved. Try again.",
  },
  "policy.promoted": {
    id: "policy.promoted",
    tone: "success",
    title: "Policy version promoted",
    description:
      "Customers accept the new version going forward. Existing acceptances stay historical.",
  },
  "policy.promote-failed": {
    id: "policy.promote-failed",
    tone: "error",
    title: "Policy not promoted",
    description: "That version could not be promoted. Try again.",
  },
  "bundle.saved": {
    id: "bundle.saved",
    tone: "success",
    title: "Package saved",
    description: "Future acquisitions use these terms. Existing entitlements keep their snapshots.",
  },
  "bundle.save-failed": {
    id: "bundle.save-failed",
    tone: "error",
    title: "Package not saved",
    description: "Those changes could not be saved. Try again.",
  },
  "bundle.status-updated": {
    id: "bundle.status-updated",
    tone: "success",
    title: "Package status updated",
    description: "Drafts stay admin-only. Archive blocks new claims without rewriting history.",
  },
  "bundle.status-failed": {
    id: "bundle.status-failed",
    tone: "error",
    title: "Package status not updated",
    description: "That status change could not be saved. Try again.",
  },
  "bundle.granted": {
    id: "bundle.granted",
    tone: "success",
    title: "Package granted",
    description: "The customer received a snapshot of the current package terms.",
  },
  "bundle.grant-failed": {
    id: "bundle.grant-failed",
    tone: "error",
    title: "Package not granted",
    description: "The grant could not be completed. Check the limit or try again.",
  },
  "bundle.revoked": {
    id: "bundle.revoked",
    tone: "success",
    title: "Package revoked",
    description: "Remaining sessions can no longer be used. History stays in the ledger.",
  },
  "bundle.acquisition-reviewed": {
    id: "bundle.acquisition-reviewed",
    tone: "success",
    title: "Package request updated",
    description: "Approval activates credits. Rejection does not create an entitlement.",
  },
  "bundle.review-failed": {
    id: "bundle.review-failed",
    tone: "error",
    title: "Package request not updated",
    description: "That review could not be saved. Try again.",
  },
} as const satisfies ExhaustiveAdminToastCopy;

export function adminToastCopy(id: AdminToastId): AdminToastCopy {
  return ADMIN_TOAST_COPY[id];
}
