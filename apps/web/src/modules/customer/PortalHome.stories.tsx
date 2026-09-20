import { needsAttentionKind } from "@balanse/domain";
import { bookings, customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PortalHome } from "./PortalHome";

const ana = customers[0];
const anaBookings = bookings.filter((booking) => booking.customerId === ana.id);

const meta = {
  title: "Customer/PortalHome",
  component: PortalHome,
  parameters: { layout: "fullscreen" },
  args: {
    profile: ana,
    bookings: anaBookings,
  },
} satisfies Meta<typeof PortalHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A confirmed next session with nothing outstanding: the settled treatment. */
export const NothingOutstanding: Story = {
  args: {
    bookings: anaBookings.filter((booking) => needsAttentionKind(booking.status) === null),
  },
};

/** Everything the customer has to act on, so the urgency band is at capacity. */
export const AttentionHeavy: Story = {
  args: {
    bookings: bookings.filter((booking) => needsAttentionKind(booking.status) !== null),
  },
};

export const EmptyInbox: Story = {
  args: { profile: customers[2], bookings: [] },
};

export const AllStatuses: Story = {
  args: { bookings },
};
