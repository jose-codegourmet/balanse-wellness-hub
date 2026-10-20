/** Customer reschedule request form contract. */
export const rescheduleFormMeta = {
  purpose:
    "Loads alternatives through publicSessionsQuery over rescheduleRange(nowIso) — a rolling eight-week window from today in Manila — and lists only sessions the customer can request now: published, reservable (not ended, full, cancelled, or past cutoff), and starting after nowIso, grouped by studio day with the nearest first. Captures a preferred session and acknowledgement, then submits a manual reschedule request; a target that fills or passes cutoff before submit surfaces the server error on the field. No same-class or price-difference filtering (OQ-2).",
  props:
    "booking: the customer's current booking; policies: current reschedule policy versions; nowIso: the instant the page was rendered (server passes it so prefetch and client share one query key; stories pin MOCK_NOW_ISO or a later date for the empty state).",
  whenToUse: "Use only on the customer booking reschedule route.",
  whenNotToUse: "Do not use for an admin resolving an existing request.",
} as const;
