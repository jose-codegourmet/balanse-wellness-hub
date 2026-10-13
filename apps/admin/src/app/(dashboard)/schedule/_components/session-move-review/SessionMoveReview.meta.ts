export const sessionMoveReviewMeta = {
  purpose:
    "Review old/new times, live booking counts and possible coach/venue clashes before saving a timeline move.",
  behavior:
    "Saves only times, rejects stale or started sessions, keeps errors visible, and invalidates schedule/roster/booking queries on success. A recurring move affects one occurrence.",
} as const;
