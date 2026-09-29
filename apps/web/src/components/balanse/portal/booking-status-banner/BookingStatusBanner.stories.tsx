import { BOOKING_STATUSES } from "@balanse/domain";
import { bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingStatusBanner } from "./BookingStatusBanner";

const confirmed = bookings.find((booking) => booking.status === "CONFIRMED") ?? bookings[0];
const meta = {
  title: "Customer/Booking status banner",
  component: BookingStatusBanner,
  args: { booking: confirmed },
} satisfies Meta<typeof BookingStatusBanner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Confirmed: Story = {};
export const Cancelled: Story = {
  args: { booking: { ...confirmed, status: "CANCELLED", refundStatus: "REFUNDED" } },
};
export const CancellationRequested: Story = {
  args: { booking: { ...confirmed, status: "CANCELLATION_REQUESTED" } },
};
export const Compact: Story = { args: { compact: true } };
export const AllStatuses: Story = {
  render: () => (
    <div className="grid gap-4">
      {BOOKING_STATUSES.map((status) => (
        <BookingStatusBanner
          key={status}
          booking={{ ...confirmed, status, refundStatus: "NOT_APPLICABLE" }}
        />
      ))}
    </div>
  ),
};
