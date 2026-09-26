import type { EventFormValues } from "./EventFormPage.schema";

export const eventFormPageMeta = {
  purpose:
    "Create or edit a session event, and publish, cancel, or archive it, without changing session date, time, capacity, or price.",
  whenToUse:
    "Use on /schedule/[sessionId]/event (session pre-bound) and /events/new (session picker). Writes go through the admin query mutations and getMockAdapter(). Gate the page on events.manage.",
  whenNotToUse:
    "Do not edit session date, time, capacity, price, or coaches here. Do not call /api/*. Do not render a roster. List and detail stay read-only.",
} as const;

export type EventFormPageProps = {
  /** Omit on /events/new so the session picker is shown. */
  sessionId?: string;
  /** Story-only. Opens a lifecycle confirm dialog after the event loads. */
  previewDialog?: "cancel" | "archive";
  /** Story-only. Runs schema validation on mount so field errors are visible. */
  showValidationErrors?: boolean;
  /** Story-only. Merged over the empty create defaults. */
  previewValues?: Partial<EventFormValues>;
};
