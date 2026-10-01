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

/** #353 community event: avatars, nicknames, opted-out guests (eye-off), onboarding answers. */
export const CommunityAvatars: Story = {
  args: { sessionId: "session-event-pilates" },
};

/** Guest sheet with goals / experience chips and expandable Interests / Other. */
export const GuestSheetWithAnswers: Story = {
  args: { sessionId: "session-event-pilates", initialGuestId: "booking-community-pil-01" },
};

/** Assigned coach (Ephraim, Capoeira event): sees answers for guests in their own session. */
export const CoachAssignedWithAnswers: Story = {
  args: { sessionId: "session-event-capoeira", initialGuestId: "booking-community-cap-02" },
  parameters: { staffId: "staff-ephraim" },
};

/**
 * Coach on an assigned session whose guests saved no answers: the sheet shows no chip row.
 * (A viewer without `customers.read` who isn't the assigned coach receives `onboarding: null`
 * from the adapter and sees the same sheet; the Coach role cannot open other rosters.)
 */
export const CoachWithoutAnswers: Story = {
  args: { sessionId: "session-wed-cutoff", initialGuestId: "booking-roster-03" },
  parameters: { staffId: "staff-ephraim" },
};
