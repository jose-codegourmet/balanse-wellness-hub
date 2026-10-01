import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import { BookingDetailPage, BookingListPage } from "./BookingPages";

const meta = {
  title: "Admin/Screens/Bookings",
  component: BookingListPage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Suspense fallback={<p>Loading bookings…</p>}>
        <Story />
      </Suspense>
    ),
  ],
} satisfies Meta<typeof BookingListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** New coverage — this module was not in the legacy AdminScreens hotspot. */
export const List: Story = {};

export const Detail: StoryObj<typeof BookingDetailPage> = {
  render: () => <BookingDetailPage bookingId="booking-held_awaiting_payment" />,
};

/** Closed booking with the final refund state and no active-booking controls. */
export const Cancelled: StoryObj<typeof BookingDetailPage> = {
  render: () => <BookingDetailPage bookingId="booking-cancelled" />,
};

/** Closed booking awaiting an external refund, with the authorized completion action. */
export const CancelledRefundPending: StoryObj<typeof BookingDetailPage> = {
  render: () => <BookingDetailPage bookingId="booking-refund-pending" />,
};
