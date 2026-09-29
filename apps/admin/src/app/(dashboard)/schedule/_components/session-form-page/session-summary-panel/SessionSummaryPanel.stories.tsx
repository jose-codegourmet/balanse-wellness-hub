import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { planOccurrences } from "../../../_lib/session-occurrences";
import { SessionSummaryPanel } from "./SessionSummaryPanel";

const startsAt = "2026-09-16T08:00:00+08:00";
const endsAt = "2026-09-16T09:30:00+08:00";
const context = { sessions: [], classId: "class-yoga", coachIds: [] };

const meta = {
  title: "Admin/Screens/SessionForm/Summary panel",
  component: SessionSummaryPanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    gymClassName: "Yoga",
    heroImage: "/assets/marketing/classes/dance-fitness-hero.webp",
    sessionName: "",
    startsAt,
    endsAt,
    venue: { name: "Balansé Studio", address: "N Escario, Cebu City", kind: "BRANCH" },
    coachNames: ["Wolf"],
    capacity: 12,
    pricePhp: 550,
    status: "PUBLISHED",
    bookable: true,
    occurrences: planOccurrences({ startsAt, endsAt, repeat: null }, context),
    editing: false,
  },
} satisfies Meta<typeof SessionSummaryPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSession: Story = {};

export const WeeklySeries: Story = {
  args: {
    occurrences: planOccurrences(
      { startsAt, endsAt, repeat: { weekdays: [3, 5], endsOn: "2026-11-10" } },
      context,
    ),
  },
};

export const WithRateSnapshot: Story = {
  args: {
    rateLines: [{ coachName: "Wolf", label: "₱650.00 / session", note: "Captured on save" }],
  },
};
