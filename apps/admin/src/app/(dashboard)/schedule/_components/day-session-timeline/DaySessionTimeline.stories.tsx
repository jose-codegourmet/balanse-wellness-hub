import { formatSessionTimeRange } from "@balanse/domain";
import { adminSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DaySessionTimeline } from "./DaySessionTimeline";
import type { SessionTimeMove } from "./DaySessionTimeline.meta";

const sessions = Array.from({ length: 8 }, (_, index) => ({
  ...adminSessions[index % adminSessions.length],
  id: `timeline-${index}`,
  name: [
    "Morning yoga",
    "Strength foundations",
    "Mat Pilates",
    "Dance practice",
    "Mobility",
    "Caliyoga",
    "Evening flow",
    "Wind down",
  ][index],
  startsAt: `2026-09-16T${String(7 + index * 2).padStart(2, "0")}:00:00+08:00`,
  endsAt: `2026-09-16T${String(8 + index * 2).padStart(2, "0")}:00:00+08:00`,
  status: "PUBLISHED" as const,
}));
const meta = {
  title: "Admin/Schedule/DaySessionTimeline",
  component: DaySessionTimeline,
  args: {
    ymd: "2026-09-16",
    sessions,
    nowIso: "2026-09-16T10:30:00+08:00",
    canMove: true,
    onSelect: () => {},
    onReviewMove: () => {},
  },
  render: function Preview(args) {
    const [review, setReview] = useState<SessionTimeMove | null>(null);
    return (
      <div className="flex h-[42rem] w-full max-w-[25rem] flex-col border border-border bg-card">
        <header className="border-b border-border p-4">
          <h2>September 16 · 8 sessions</h2>
          <p className="text-xs">Drag the grip, or use arrow keys and Enter.</p>
        </header>
        <DaySessionTimeline {...args} onReviewMove={setReview} />
        {review ? (
          <p role="status" className="border-t border-border p-4">
            Review: {formatSessionTimeRange(review.startsAt, review.endsAt)}
          </p>
        ) : null}
      </div>
    );
  },
} satisfies Meta<typeof DaySessionTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EightSessions: Story = {};
export const ReadOnly: Story = { args: { canMove: false } };
export const Empty: Story = { args: { sessions: [] } };
export const Overlapping: Story = {
  args: {
    sessions: sessions.slice(0, 3).map((session, index) => ({
      ...session,
      startsAt: `2026-09-16T12:${index === 1 ? "30" : "00"}:00+08:00`,
      endsAt: "2026-09-16T14:00:00+08:00",
    })),
  },
};
export const OvernightMove: Story = {
  args: {
    nowIso: "2026-09-16T20:00:00+08:00",
    sessions: [
      {
        ...sessions[0],
        name: "Brazilian Jiu-Jitsu",
        startsAt: "2026-09-16T23:15:00+08:00",
        endsAt: "2026-09-17T00:45:00+08:00",
      },
      {
        ...sessions[1],
        name: "Late practice",
        startsAt: "2026-09-16T23:45:00+08:00",
        endsAt: "2026-09-17T03:45:00+08:00",
      },
    ],
  },
};

export const OvernightContinuation: Story = {
  args: {
    ymd: "2026-09-17",
    nowIso: "2026-09-16T20:00:00+08:00",
    sessions: [
      {
        ...sessions[0],
        name: "Late practice",
        startsAt: "2026-09-16T23:45:00+08:00",
        endsAt: "2026-09-17T03:45:00+08:00",
      },
    ],
  },
};
