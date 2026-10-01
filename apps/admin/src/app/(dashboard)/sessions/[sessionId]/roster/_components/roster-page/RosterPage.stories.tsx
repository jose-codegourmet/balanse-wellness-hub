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

/** Every booking status in one grid: to check in, checked in, held, waitlist, no-show. */
export const Default: Story = {};

/** Class about to start: 2 checked in, 3 still to check in, 1 paying at the counter. */
export const DoorCheckIn: Story = {
  args: { sessionId: "session-wed-cutoff" },
};

/** Guest sheet for a CONFIRMED guest: Check in and No-show actions. */
export const GuestSheetToCheckIn: Story = {
  args: { sessionId: "session-wed-cutoff", initialGuestId: "booking-roster-03" },
};

/** Guest sheet for a held guest: payment first, no attendance actions. */
export const GuestSheetHeld: Story = {
  args: { sessionId: "session-wed-cutoff", initialGuestId: "booking-roster-06" },
};

export const CoachOwned: Story = {
  args: { sessionId: "session-wed-cutoff" },
  parameters: { staffId: "staff-ephraim" },
};

export const CoachCrossBoundary: Story = {
  args: { sessionId: "session-wed-open" },
  parameters: { staffId: "staff-ephraim" },
};
