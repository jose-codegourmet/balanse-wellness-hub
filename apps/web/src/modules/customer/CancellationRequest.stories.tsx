import { bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CancellationRequest } from "./CancellationRequest";

const confirmed = bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0];

const meta = {
  title: "Customer/CancellationRequest",
  component: CancellationRequest,
  args: { booking: confirmed },
} satisfies Meta<typeof CancellationRequest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
export const Success: Story = { args: { forcedStatus: "success" } };
export const Failed: Story = { args: { forcedStatus: "failed" } };
