import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookingDetailPage, BookingListPage } from "./BookingPages";

const meta = {
  title: "Admin/Screens/Bookings",
  component: BookingListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof BookingListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** New coverage — this module was not in the legacy AdminScreens hotspot. */
export const List: Story = {};

export const Detail: StoryObj<typeof BookingDetailPage> = {
  render: () => <BookingDetailPage bookingId="booking-held_awaiting_payment" />,
};
