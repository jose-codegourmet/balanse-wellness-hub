import type { AdminSession, VenueKind } from "@balanse/domain";

export const eventSessionPickerMeta = {
  purpose:
    "Searchable, week-grouped session chooser for the event composer's first step. Only sessions that can take an event are shown by default.",
  whenToUse:
    "Use inside EventFormPage on /events/new. The page owns the value through FormField; this component only renders choices and reports the picked id.",
  whenNotToUse:
    "Do not use when the route already binds a session (/schedule/[sessionId]/event). Do not edit session date, time, capacity, or price here.",
} as const;

export type SessionChoice = {
  id: string;
  className: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  priceLabel: string;
  statusLabel: string;
  status: AdminSession["status"];
  /** Why this session cannot take a new event, or null when it can. */
  blocked: "cancelled" | "taken" | null;
  eventId?: string;
  eventTitle?: string;
  pricePlaceholder: boolean;
  /** Where the session runs. Null when the venue can no longer be resolved. */
  venue: { name: string; address: string; kind: VenueKind } | null;
};

export type EventSessionPickerProps = {
  choices: readonly SessionChoice[];
  value: string;
  onChange: (sessionId: string) => void;
  invalid?: boolean;
  /** Opens the full session form in a dialog. Omit to hide the create action. */
  onCreateSession?: () => void;
  /** Story-only. Starts with unavailable sessions listed. */
  defaultShowUnavailable?: boolean;
};
