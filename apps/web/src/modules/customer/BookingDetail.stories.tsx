import { BOOKING_STATUSES } from "@balanse/domain";
import { bookings, customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingDetail } from "./BookingDetail";

const confirmed = bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0];

const meta = {
  title: "Customer/BookingDetail",
  component: BookingDetail,
  args: { booking: confirmed, profile: customers[0] },
} satisfies Meta<typeof BookingDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmed: Story = {};
export const PaymentNeeded: Story = {
  args: {
    booking: bookings.find((booking) => booking.status === "HELD_AWAITING_PAYMENT") ?? confirmed,
  },
};
export const Cancelled: Story = {
  args: { booking: bookings.find((booking) => booking.status === "CANCELLED") ?? confirmed },
};

export const StatusVariants: Story = {
  render: () => (
    <div className="space-y-10">
      {BOOKING_STATUSES.map((status) => {
        const booking = bookings.find((row) => row.status === status) ?? confirmed;
        return <BookingDetail key={status} booking={booking} profile={customers[0]} />;
      })}
    </div>
  ),
};
