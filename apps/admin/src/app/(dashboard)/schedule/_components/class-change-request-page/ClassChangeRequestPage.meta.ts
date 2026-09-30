export const classChangeRequestPageMeta = {
  purpose:
    "Coach-facing: ask the studio to reschedule a class, hand it to a substitute coach, or cancel it. Coaches cannot cancel directly; nothing changes until an admin approves.",
  whenToUse:
    "Use on /schedule/[sessionId]/change (?kind=reschedule|substitute|cancel preselects the path). Only the assigned coach can submit; one pending request per class.",
  whenNotToUse: "Do not use for admins who can edit or cancel the session directly.",
} as const;
