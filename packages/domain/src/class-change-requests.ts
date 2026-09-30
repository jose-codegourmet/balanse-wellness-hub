import type { PermissionKey } from "./permissions";

/**
 * Coach class change requests (#337). A coach never cancels a class on their
 * own: they ask the studio to reschedule it, hand it to a substitute coach, or
 * cancel it. Nothing changes until an Admin / Super Admin approves.
 *
 * Mock-only this phase. No new permission keys: requesting is scoped to the
 * coach assigned to the session; approving needs the permission that would
 * make the change directly (`CLASS_CHANGE_APPROVAL_PERMISSION`).
 */
export const CLASS_CHANGE_REQUEST_KINDS = ["RESCHEDULE", "SUBSTITUTE", "CANCEL"] as const;
export type ClassChangeRequestKind = (typeof CLASS_CHANGE_REQUEST_KINDS)[number];

export const CLASS_CHANGE_REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "DENIED",
  "WITHDRAWN",
] as const;
export type ClassChangeRequestStatus = (typeof CLASS_CHANGE_REQUEST_STATUSES)[number];

export const CLASS_CHANGE_KIND_META: Record<
  ClassChangeRequestKind,
  { label: string; action: string; description: string }
> = {
  RESCHEDULE: {
    label: "Reschedule",
    action: "Reschedule the class",
    description: "Propose a new date and start time. Booked customers move with the class.",
  },
  SUBSTITUTE: {
    label: "Substitute coach",
    action: "Find a substitute",
    description: "Name the coach who will teach instead. The class keeps its time.",
  },
  CANCEL: {
    label: "Cancellation",
    action: "Request cancellation",
    description:
      "Only if rescheduling or a substitute will not work. Bookings go to manual refund handling if approved.",
  },
};

export const CLASS_CHANGE_STATUS_LABELS: Record<ClassChangeRequestStatus, string> = {
  PENDING: "Awaiting approval",
  APPROVED: "Approved",
  DENIED: "Denied",
  WITHDRAWN: "Withdrawn",
};

/** Approving a request needs the permission that would make the change directly. */
export const CLASS_CHANGE_APPROVAL_PERMISSION: Record<ClassChangeRequestKind, PermissionKey> = {
  RESCHEDULE: "schedule.update",
  SUBSTITUTE: "schedule.update",
  CANCEL: "schedule.cancel",
};

export const CLASS_CHANGE_REVIEW_PERMISSIONS: readonly PermissionKey[] = [
  "schedule.update",
  "schedule.cancel",
];

export type ClassChangeRequest = {
  id: string;
  sessionId: string;
  /** Session as it was when the request was made. */
  session: {
    className: string;
    startsAt: string;
    endsAt: string;
    coachName: string;
  };
  kind: ClassChangeRequestKind;
  status: ClassChangeRequestStatus;
  reason: string;
  requestedByStaffId: string;
  requestedByCoachId: string;
  requestedByName: string;
  /** RESCHEDULE only. Duration stays the same as the original session. */
  proposedStartsAt: string | null;
  proposedEndsAt: string | null;
  /** SUBSTITUTE only. */
  substituteCoachId: string | null;
  substituteCoachName: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByStaffId: string | null;
  reviewedByName: string | null;
  /** Required when denying; optional note when approving. */
  decisionNote: string | null;
};

export type CreateClassChangeRequestInput = {
  sessionId: string;
  kind: ClassChangeRequestKind;
  reason: string;
  proposedStartsAt?: string | null;
  substituteCoachId?: string | null;
};

/** A coach who could teach the session instead, with a clash flag. */
export type SubstituteCoachOption = {
  id: string;
  name: string;
  /** True when the coach already teaches another session that overlaps. */
  clash: boolean;
};

export const CLASS_CHANGE_REASON_MIN = 10;
export const CLASS_CHANGE_REASON_MAX = 500;

export function isClassChangeReviewable(request: Pick<ClassChangeRequest, "status">): boolean {
  return request.status === "PENDING";
}

/** Plain-language summary of what approving does, for confirm dialogs and cards. */
export function classChangeEffect(
  request: Pick<
    ClassChangeRequest,
    "kind" | "proposedStartsAt" | "substituteCoachName" | "requestedByName"
  >,
  formatDateTime: (iso: string) => string,
): string {
  if (request.kind === "RESCHEDULE" && request.proposedStartsAt) {
    return `Moves the class to ${formatDateTime(request.proposedStartsAt)}. Booked customers move with it.`;
  }
  if (request.kind === "SUBSTITUTE") {
    return `${request.substituteCoachName ?? "The substitute"} teaches instead of ${request.requestedByName}. The time stays the same.`;
  }
  return "Cancels the class. Affected bookings enter manual refund handling. The session stays in history.";
}
