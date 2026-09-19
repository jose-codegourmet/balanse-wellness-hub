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
    description: "Clear the class filter or pick another type to see sessions again.",
    actionLabel: "Show all classes",
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
};
