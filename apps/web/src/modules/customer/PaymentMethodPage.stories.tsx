import { bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentMethodPage } from "./PaymentMethodPage";

const held =
  bookings.find((booking) => booking.id === "booking-held_awaiting_payment") ?? bookings[1];
const capped = bookings.find((booking) => booking.id === "booking-hold-capped") ?? held;

const meta = {
  title: "Customer/PaymentMethod",
  component: PaymentMethodPage,
  args: { booking: held },
} satisfies Meta<typeof PaymentMethodPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HoldCappedAtClassStart: Story = { args: { booking: capped } };
export const Expired: Story = { args: { forcedExpired: true } };
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
