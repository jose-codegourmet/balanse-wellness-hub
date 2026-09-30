import { bookings, customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MyBookingsPage } from "./MyBookingsPage";

const ana = customers[0];

const meta = {
  title: "Customer/MyBookingsPage",
  component: MyBookingsPage,
  parameters: { layout: "fullscreen" },
  args: { bookings: bookings.filter((booking) => booking.customerId === ana.id) },
} satisfies Meta<typeof MyBookingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = { args: { initialTab: "pending" } };

export const Empty: Story = { args: { bookings: [] } };
