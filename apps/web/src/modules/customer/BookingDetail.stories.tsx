import { BOOKING_STATUSES } from "@balanse/domain";
import { bookings, customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingDetail } from "./BookingDetail";

const byId = (id: string) => bookings.find((booking) => booking.id === id);
const byStatus = (status: string) => bookings.find((booking) => booking.status === status);
const confirmed = byStatus("CONFIRMED") ?? bookings[0];

const meta = {
  title: "Customer/BookingDetail",
  component: BookingDetail,
  parameters: { layout: "fullscreen" },
  args: { booking: confirmed, profile: customers[0] },
} satisfies Meta<typeof BookingDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmed: Story = {};

/** Held: pay-at-counter instruction plus both request actions. */
export const PaymentNeeded: Story = {
  args: { booking: byId("booking-counter-held") ?? byStatus("HELD_AWAITING_PAYMENT") ?? confirmed },
};

/** Waitlisted: informational advisory, and reschedule is not offered. */
export const Waitlisted: Story = {
  args: { booking: byStatus("WAITLISTED") ?? confirmed },
};

/** A held request: the slot stays held while the studio resolves it. */
export const RescheduleRequested: Story = {
  args: { booking: byStatus("RESCHEDULE_REQUESTED") ?? confirmed },
};

/** A refund in flight must never read like a confirmation. */
export const RefundPending: Story = {
  args: { booking: byId("booking-refund-pending") ?? confirmed, profile: customers[1] },
};

/** Terminal states read closed and offer no customer action. */
export const Terminal: Story = {
  render: () => (
    <div>
      {["CANCELLED", "EXPIRED", "REJECTED"].map((status) => {
        const booking = byStatus(status) ?? confirmed;
        return <BookingDetail key={status} booking={booking} profile={customers[0]} />;
      })}
    </div>
  ),
};

export const StatusVariants: Story = {
  render: () => (
    <div>
      {BOOKING_STATUSES.map((status) => {
        const booking = byStatus(status) ?? confirmed;
        return <BookingDetail key={status} booking={booking} profile={customers[0]} />;
      })}
    </div>
  ),
};
