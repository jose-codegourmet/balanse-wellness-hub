import type { AdminSession } from "@balanse/domain";

export type SessionTimeMove = { session: AdminSession; startsAt: string; endsAt: string };
export type DaySessionTimelineProps = {
  ymd: string;
  sessions: AdminSession[];
  canMove: boolean;
  onSelect: (id: string) => void;
  onReviewMove: (move: SessionTimeMove) => void;
  /** Frozen clock for standalone previews; runtime uses the live admin clock. */
  nowIso?: string;
};
export const daySessionTimelineMeta = {
  purpose:
    "Manila day timeline with overlapping session lanes, overnight continuations, live time marker and reviewed time moves.",
  interaction:
    "Click a session for details. Drag its grip or use Arrow keys in 15-minute steps, Enter to review, Escape to cancel. Only future, non-cancelled sessions can move from their start day; duration is preserved even when the end crosses midnight. The next day shows the remaining time without a move grip.",
} as const;
