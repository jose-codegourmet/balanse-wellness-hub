import type { AdminSession } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { planOccurrences } from "../../_lib/session-occurrences";
import { OccurrencePreview } from "./OccurrencePreview";

const busy = {
  id: "session-busy",
  classId: "class-yoga",
  venueId: "venue-main-studio",
  name: null,
  className: "Yoga",
  coaches: [{ id: "coach-wolf", name: "Wolf", photoKey: null }],
  coachName: "Wolf",
  coachAssignments: [],
  coachRatePhp: 0,
  startsAt: "2026-09-30T00:00:00.000Z",
  endsAt: "2026-09-30T01:30:00.000Z",
  pricePhp: 550,
  capacity: 12,
  remainingSlots: 12,
  reservable: true,
  availability: "open",
  status: "PUBLISHED",
  bookable: true,
} satisfies AdminSession;

const occurrences = planOccurrences(
  {
    startsAt: "2026-09-16T08:00:00+08:00",
    endsAt: "2026-09-16T09:30:00+08:00",
    repeat: { weekdays: [1, 3], endsOn: "2026-11-10" },
  },
  {
    sessions: [busy],
    classId: "class-pilates",
    coachIds: ["coach-wolf"],
  },
);

const meta = {
  title: "Admin/Screens/Schedule/Occurrence preview",
  component: OccurrencePreview,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
  args: { occurrences },
} satisfies Meta<typeof OccurrencePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WeeklySeriesWithClash: Story = {};

export const SingleSession: Story = { args: { occurrences: occurrences.slice(0, 1) } };
