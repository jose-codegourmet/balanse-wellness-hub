import type { EventFormValues } from "./EventFormPage.schema";

export const eventFormPageMeta = {
  purpose:
    "Step-by-step event composer (Session → Story → Look → Logistics → Review) with a live customer preview. Creates or edits a session event and can publish it on save, without changing session date, time, capacity, or price.",
  whenToUse:
    "Use on /schedule/[sessionId]/event (session pre-bound, Session step skipped) and /events/new (session picker step). Create walks the steps in order with per-step validation; edit opens any step. Writes go through the admin query mutations and getMockAdapter(). Gate the page on events.manage. Publish, cancel, and archive for an existing event live in the page header actions.",
  whenNotToUse:
    "Do not edit session date, time, capacity, price, or coaches here. Do not call /api/*. Do not render a roster. List and detail stay read-only. Class and session forms keep AdminWizard; this composer is event-specific.",
} as const;

export type EventFormStepId = "session" | "story" | "look" | "logistics" | "review";

export type EventFormPageProps = {
  /** Omit on /events/new so the session picker step is shown. */
  sessionId?: string;
  /** Story-only. Opens a lifecycle confirm dialog after the event loads. */
  previewDialog?: "cancel" | "archive";
  /** Story-only. Opens this step with every step unlocked. */
  previewStep?: EventFormStepId;
  /** Story-only. Runs schema validation on mount so field errors are visible. */
  showValidationErrors?: boolean;
  /** Story-only. Merged over the empty create defaults. */
  previewValues?: Partial<EventFormValues>;
};
