import { bookings, paymentInstructions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GcashProofPage } from "./GcashProofPage";

const held =
  bookings.find((booking) => booking.id === "booking-held_awaiting_payment") ?? bookings[1];

const meta = {
  title: "Customer/GcashProof",
  component: GcashProofPage,
  args: { booking: held, instructions: paymentInstructions },
} satisfies Meta<typeof GcashProofPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const UploadFailed: Story = { args: { forcedStatus: "failed" } };
export const SubmittedUnderReview: Story = { args: { forcedStatus: "submitted" } };
