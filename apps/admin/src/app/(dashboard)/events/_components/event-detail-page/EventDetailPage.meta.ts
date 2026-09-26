import type { AdminEvent } from "@balanse/domain";

export const eventDetailPageMeta = {
  purpose:
    "Read-only admin event: content, linked session, roster link, publish guard, and status history.",
  whenToUse: "Use on /events/[eventId]. Reads go through the admin query factories.",
  whenNotToUse:
    "Do not add publish, cancel, archive, or edit controls. Do not list attendees; link to the session roster.",
} as const;

export type EventDetailPageProps = {
  eventId: string;
  loading?: boolean;
  error?: boolean;
  /** Story override for a session state the fixture catalogue does not store. */
  preview?: AdminEvent | null;
};
