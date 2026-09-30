import { bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CancellationRequest } from "./CancellationRequest";

const confirmed = bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0];

const meta = {
  title: "Customer/CancellationRequest",
  component: CancellationRequest,
  parameters: { layout: "fullscreen" },
  args: { booking: confirmed },
} satisfies Meta<typeof CancellationRequest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Failed: Story = { args: { forcedStatus: "failed" } };
export const Submitted: Story = { args: { forcedStatus: "success" } };
