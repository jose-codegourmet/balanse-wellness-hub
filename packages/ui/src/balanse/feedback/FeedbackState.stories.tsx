import { FEEDBACK_STATE_IDS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarSkeleton, FeedbackState, LocalizedSkeleton } from "./FeedbackState";

const meta = {
  title: "Shared/FeedbackStates",
  component: FeedbackState,
} satisfies Meta<typeof FeedbackState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  args: { id: "calendar.no-sessions" },
  render: () => (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {FEEDBACK_STATE_IDS.map((id) => (
        <FeedbackState key={id} id={id} onAction={() => undefined} />
      ))}
    </div>
  ),
};

export const LocalizedLoading: Story = {
  args: { id: "calendar.load-failed" },
  render: () => (
    <div className="space-y-6 p-4">
      <LocalizedSkeleton label="Loading bookings" />
      <CalendarSkeleton />
    </div>
  ),
};
