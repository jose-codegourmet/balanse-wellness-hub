import { bookings, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RescheduleRequest } from "./RescheduleRequest";

const confirmed = bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0];
const openSessions = publicSessions.filter((session) => session.reservable);
const fullSession = publicSessions.find((session) => session.availability === "full_with_waitlist");

const meta = {
  title: "Customer/RescheduleRequest",
  component: RescheduleRequest,
  parameters: { layout: "fullscreen" },
  args: { booking: confirmed, sessions: publicSessions },
} satisfies Meta<typeof RescheduleRequest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every alternative is bookable, so nothing in the picker is disabled. */
export const AllSelectable: Story = {
  args: { sessions: openSessions },
};

/** A full target is visibly distinct and cannot be submitted. */
export const HasFullSessions: Story = {
  args: {
    sessions: fullSession ? [fullSession, ...openSessions] : publicSessions,
  },
};

export const EmptyAlternatives: Story = { args: { forcedStatus: "empty" } };

/** Progress stays on the action; the page never blanks out. */
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
