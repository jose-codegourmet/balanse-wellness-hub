export const classChangeRequestCardMeta = {
  purpose:
    "One coach class change request: kind, status, current vs proposed time or coach swap, reason, and the decision note.",
  whenToUse:
    "Use in the admin queue and on the coach's request page. Pass footer actions when reviewable.",
  whenNotToUse: "Do not use for customer booking requests (AdminQueueCard).",
} as const;
