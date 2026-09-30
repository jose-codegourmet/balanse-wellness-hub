export const classChangeQueuePageMeta = {
  purpose:
    "Admin / Super Admin queue for coach class change requests (reschedule, substitute, cancel). Approving applies the change; denying needs a note and keeps the class.",
  whenToUse:
    "Use on /schedule/requests. Approve needs schedule.cancel (cancel) or schedule.update (reschedule / substitute); nobody reviews their own request.",
  whenNotToUse:
    "Do not use for customer booking cancellations or reschedules — those are /cancellations and /reschedules.",
} as const;
