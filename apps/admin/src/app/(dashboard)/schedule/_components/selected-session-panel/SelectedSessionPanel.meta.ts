import type { AdminSession, computeSessionInventory } from "@balanse/domain";

export const selectedSessionPanelMeta = {
  purpose:
    "The /schedule day sidebar: the open day's sessions as a list, and full details and actions (roster, edit, repeat, event, cancel) for the selected session.",
  whenToUse:
    "Opened from AdminScheduleCalendar when a day box or a session is clicked. Inline beside the calendar on desktop, inside a Sheet on smaller screens.",
  whenNotToUse:
    "Not an editor. Editing goes through the session dialog (/schedule/[sessionId]); rosters open /sessions/[sessionId]/roster.",
} as const;

export type SessionInventory = ReturnType<typeof computeSessionInventory>;

export type SelectedSessionPanelProps = {
  /** The open day (YYYY-MM-DD, Asia/Manila). */
  ymd: string;
  /** Sessions on that day, sorted by start time. */
  daySessions: AdminSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onClose: () => void;
  /** Live inventory for the selected session, or null while it loads. */
  inventory: SessionInventory | null;
  /** Hide the close button when a Sheet already renders one. */
  hideClose?: boolean;
};
