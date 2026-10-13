/** Customer reschedule request form contract. */
export const rescheduleFormMeta = {
  purpose:
    "Loads published alternatives through publicSessionsQuery, captures a preferred session and acknowledgement, then submits a manual reschedule request.",
  whenToUse: "Use only on the customer booking reschedule route.",
  whenNotToUse: "Do not use for an admin resolving an existing request.",
} as const;
