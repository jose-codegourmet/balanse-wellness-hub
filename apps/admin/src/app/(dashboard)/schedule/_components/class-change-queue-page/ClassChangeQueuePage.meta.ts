export const classChangeQueuePageMeta = {
  purpose:
    "Admin / Super Admin queue for coach class change requests (reschedule, substitute, cancel). Approving applies the change; denying needs a note and keeps the class.",
  whenToUse:
    "Use on /schedule/requests. Approve needs schedule.cancel (cancel) or schedule.update (reschedule / substitute); nobody reviews their own request.",
  whenNotToUse:
    "Do not use for customer booking cancellations or reschedules — those are /cancellations and /reschedules.",
  data: "The API returns the review queue. Approve and deny mutations enforce the kind-specific permission and reject self-review server-side.",
} as const;
