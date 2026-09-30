import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RosterPage } from "./RosterPage";

const meta = {
  title: "Admin/Screens/Roster",
  component: RosterPage,
  tags: ["autodocs"],
  args: { sessionId: "session-wed-open" },
} satisfies Meta<typeof RosterPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Confirmed, checked-in, completed, no-show, held, and waitlisted rows. */
export const Default: Story = {};

/** Class about to start: 2 checked in, 3 still to check in, 1 paying at the counter. */
export const DoorCheckIn: Story = {
  args: { sessionId: "session-wed-cutoff" },
};

export const CoachOwned: Story = {
  args: { sessionId: "session-wed-cutoff" },
  parameters: { staffId: "staff-ephraim" },
};

export const CoachCrossBoundary: Story = {
  args: { sessionId: "session-wed-open" },
  parameters: { staffId: "staff-ephraim" },
};
