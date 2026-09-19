import { bookings, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RescheduleRequest } from "./RescheduleRequest";

const confirmed = bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0];

const meta = {
  title: "Customer/RescheduleRequest",
  component: RescheduleRequest,
  args: { booking: confirmed, sessions: publicSessions },
} satisfies Meta<typeof RescheduleRequest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const EmptyAlternatives: Story = { args: { forcedStatus: "empty" } };
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
