import type { EventStatus } from "@balanse/domain";

export const eventListPageMeta = {
  purpose:
    "Admin index of session events: upcoming first, with state, date, title, and session filters.",
  whenToUse: "Use on /events. Reads go through the admin query factories and getMockAdapter().",
  whenNotToUse:
    "Do not use for create, edit, publish, cancel, or archive. Those belong on the session event form. Do not render a roster here.",
} as const;

export type EventListPageProps = {
  /** Genuinely empty catalogue, distinct from a filter that matches nothing. */
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  initialStatus?: EventStatus | "all";
  initialSearch?: string;
};
