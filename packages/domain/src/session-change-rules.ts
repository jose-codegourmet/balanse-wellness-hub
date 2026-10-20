/**
 * Per-session change rules (#380). A session may refuse customer cancellation
 * or reschedule requests (one-off events). These are admin capabilities on the
 * session, not deadlines or price rules: canonical rules 42–51 and 63–64 stay
 * open, staff can still cancel sessions or bookings, and refunds stay manual.
 */

import type { PublicSession } from "./types";

export type SessionChangeRules = Pick<PublicSession, "cancellable" | "reschedulable">;

export const SESSION_CHANGE_RULE_LABELS = {
  cancellable: "No cancellations",
  reschedulable: "No reschedules",
} as const;

/** 409 codes returned by the customer request routes when a rule is off. */
export const BOOKING_NOT_CANCELLABLE_CODE = "booking_not_cancellable";
export const BOOKING_NOT_RESCHEDULABLE_CODE = "booking_not_reschedulable";

export function sessionAllowsCustomerChanges(session: Partial<SessionChangeRules>): boolean {
  return session.cancellable !== false && session.reschedulable !== false;
}

/** Badge labels for the rules that are off, in display order. Empty when both are on. */
export function sessionChangeRuleLabels(session: Partial<SessionChangeRules>): string[] {
  const labels: string[] = [];
  if (session.cancellable === false) labels.push(SESSION_CHANGE_RULE_LABELS.cancellable);
  if (session.reschedulable === false) labels.push(SESSION_CHANGE_RULE_LABELS.reschedulable);
  return labels;
}

/** "No cancellations · No reschedules", or null when both rules are on. */
export function sessionChangeRulesLabel(session: Partial<SessionChangeRules>): string | null {
  const labels = sessionChangeRuleLabels(session);
  return labels.length > 0 ? labels.join(" · ") : null;
}

function changeNoun(session: Partial<SessionChangeRules>): string | null {
  const cancel = session.cancellable === false;
  const move = session.reschedulable === false;
  if (cancel && move) return "cancelled or rescheduled";
  if (cancel) return "cancelled";
  if (move) return "rescheduled";
  return null;
}

/** Checkbox copy on the booking form; null when the session accepts both requests. */
export function sessionChangeAcknowledgement(session: Partial<SessionChangeRules>): string | null {
  const noun = changeNoun(session);
  return noun ? `I understand this reservation cannot be ${noun}.` : null;
}

/** Plain-language notice for the booking form, booking detail, and blocked request routes. */
export function sessionChangeRulesNotice(session: Partial<SessionChangeRules>): string | null {
  const noun = changeNoun(session);
  if (!noun) return null;
  return `Bookings on this session cannot be ${noun} by request. If something comes up, contact the studio.`;
}
