/**
 * Enumerated empty / error states from docs/screen-specs/shared/03-empty-error-states.md.
 */

export const FEEDBACK_STATE_IDS = [
  "calendar.no-sessions",
  "calendar.filter-empty",
  "calendar.load-failed",
  "calendar.session-became-full",
  "customer.no-bookings",
  "customer.no-upcoming",
  "customer.no-history",
  "customer.proof-upload-failed",
  "customer.reservation-expired",
  "admin.no-pending-payments",
  "admin.no-cancellation-requests",
  "admin.no-reschedule-requests",
  "admin.no-customers",
  "admin.no-sessions",
  "admin.no-staff",
  "admin.no-roles",
  "admin.roles-forbidden",
  "admin.roles-load-failed",
  "admin.no-classes",
  "admin.no-coaches",
  "admin.no-payment-qrs",
  "admin.no-bundles",
  "admin.no-package-reviews",
  "admin.no-events",
  "admin.event-not-found",
  "customer.no-packages",
  "public.no-packages",
] as const;

export type FeedbackStateId = (typeof FEEDBACK_STATE_IDS)[number];

export type FeedbackKind = "empty" | "error";

export type FeedbackStateCopy = {
  id: FeedbackStateId;
  kind: FeedbackKind;
  title: string;
  description: string;
  actionLabel?: string;
};

export const FEEDBACK_STATE_DEFAULTS: Record<FeedbackStateId, FeedbackStateCopy> = {
  "calendar.no-sessions": {
    id: "calendar.no-sessions",
    kind: "empty",
    title: "No sessions on this day",
    description: "Nothing is published for the selected date. Try another day on the calendar.",
  },
  "calendar.filter-empty": {
    id: "calendar.filter-empty",
    kind: "empty",
    title: "No classes match this filter",
    description: "Clear the class or coach filter, or pick another type to see sessions again.",
    actionLabel: "Show all sessions",
  },
  "calendar.load-failed": {
    id: "calendar.load-failed",
    kind: "error",
    title: "Schedule could not load",
    description: "The calendar did not load. Check your connection and try again.",
    actionLabel: "Retry",
  },
  "calendar.session-became-full": {
    id: "calendar.session-became-full",
    kind: "error",
    title: "This session just filled up",
    description:
      "The last spot was taken while you were viewing it. Join the waitlist if it is open.",
    actionLabel: "Join waitlist",
  },
  "customer.no-bookings": {
    id: "customer.no-bookings",
    kind: "empty",
    title: "No bookings yet",
    description: "When you reserve a class, it will show up here.",
    actionLabel: "Browse the schedule",
  },
  "customer.no-upcoming": {
    id: "customer.no-upcoming",
    kind: "empty",
    title: "No upcoming bookings",
    description: "You have no future reservations. Past visits stay in History.",
    actionLabel: "Reserve a class",
  },
  "customer.no-history": {
    id: "customer.no-history",
    kind: "empty",
    title: "No booking history",
    description: "Completed and cancelled visits will appear here after your first class.",
  },
  "customer.proof-upload-failed": {
    id: "customer.proof-upload-failed",
    kind: "error",
    title: "Proof upload failed",
    description: "We could not save that image. Check the file and try again.",
    actionLabel: "Try again",
  },
  "customer.reservation-expired": {
    id: "customer.reservation-expired",
    kind: "error",
    title: "Reservation expired",
    description: "The payment window closed. Reserve again if spots are still open.",
    actionLabel: "Back to schedule",
  },
  "admin.no-pending-payments": {
    id: "admin.no-pending-payments",
    kind: "empty",
    title: "No pending payments",
    description: "There are no proofs waiting for review right now.",
  },
  "admin.no-cancellation-requests": {
    id: "admin.no-cancellation-requests",
    kind: "empty",
    title: "No cancellation requests",
    description: "Customer cancellation requests will land in this queue.",
  },
  "admin.no-reschedule-requests": {
    id: "admin.no-reschedule-requests",
    kind: "empty",
    title: "No reschedule requests",
    description: "Customer reschedule requests will land in this queue.",
  },
  "admin.no-customers": {
    id: "admin.no-customers",
    kind: "empty",
    title: "No customers found",
    description: "Nothing matches this search. Clear filters to see the full list.",
    actionLabel: "Clear search",
  },
  "admin.no-sessions": {
    id: "admin.no-sessions",
    kind: "empty",
    title: "No sessions scheduled",
    description: "Publish a session to populate the studio calendar.",
  },
  "admin.no-staff": {
    id: "admin.no-staff",
    kind: "empty",
    title: "No staff found",
    description: "No staff accounts match this view.",
  },
  "admin.no-roles": {
    id: "admin.no-roles",
    kind: "empty",
    title: "No roles yet",
    description: "Create a custom role from the permission checklist, or clone a built-in role.",
    actionLabel: "Create role",
  },
  "admin.roles-forbidden": {
    id: "admin.roles-forbidden",
    kind: "error",
    title: "You cannot open roles",
    description: "This staff role does not include roles.read or roles.manage.",
  },
  "admin.roles-load-failed": {
    id: "admin.roles-load-failed",
    kind: "error",
    title: "Roles could not load",
    description: "The role catalogue did not load. Check the mock harness and try again.",
    actionLabel: "Retry",
  },
  "admin.no-classes": {
    id: "admin.no-classes",
    kind: "empty",
    title: "No classes yet",
    description: "Add a class to start publishing sessions on the studio calendar.",
  },
  "admin.no-coaches": {
    id: "admin.no-coaches",
    kind: "empty",
    title: "No coaches yet",
    description: "Add a coach to assign sessions and publish the schedule.",
  },
  "admin.no-payment-qrs": {
    id: "admin.no-payment-qrs",
    kind: "empty",
    title: "No payment QR yet",
    description: "Upload the GCash or InstaPay QR customers use to pay the studio.",
  },
  "admin.no-bundles": {
    id: "admin.no-bundles",
    kind: "empty",
    title: "No packages yet",
    description: "Create a package to grant or sell a fixed number of sessions.",
  },
  "admin.no-package-reviews": {
    id: "admin.no-package-reviews",
    kind: "empty",
    title: "No package reviews",
    description: "Paid package requests appear here after a customer submits them.",
  },
  "admin.no-events": {
    id: "admin.no-events",
    kind: "empty",
    title: "No events yet",
    description:
      "Events wrap a scheduled session. Create one from a session that does not already have an event.",
  },
  "admin.event-not-found": {
    id: "admin.event-not-found",
    kind: "error",
    title: "Event not found",
    description:
      "That event is not in the catalogue. It may have been archived, or the link is out of date.",
    actionLabel: "Back to events",
  },
  "customer.no-packages": {
    id: "customer.no-packages",
    kind: "empty",
    title: "No packages yet",
    description: "Claim a free package or request a paid one. Sessions remaining are not cash.",
    actionLabel: "Browse packages",
  },
  "public.no-packages": {
    id: "public.no-packages",
    kind: "empty",
    title: "No packages published",
    description: "The studio has not published a package yet. Check back soon.",
  },
};
