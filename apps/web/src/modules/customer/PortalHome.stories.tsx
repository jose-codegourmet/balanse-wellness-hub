import { bookings, customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PortalHome } from "./PortalHome";

const ana = customers[0];

const meta = {
  title: "Customer/PortalHome",
  component: PortalHome,
  args: {
    profile: ana,
    bookings: bookings.filter((booking) => booking.customerId === ana.id),
  },
} satisfies Meta<typeof PortalHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const EmptyInbox: Story = {
  args: { profile: customers[2], bookings: [] },
};
export const AllStatuses: Story = {
  args: { bookings },
};
