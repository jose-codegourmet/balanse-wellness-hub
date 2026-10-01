import type { PublicSessionPage } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PublicBookingBar } from "./PublicBookingBar";

const session: PublicSessionPage = {
  id: "session-event-pilates",
  name: "Pilates for a Cause",
  classId: "class-pilates",
  className: "Mat Pilates",
  classSlug: "mat-pilates",
  classShortDescription: "",
  heroImage: null,
  coaches: [],
  coachesDetailed: [],
  coachName: "",
  startsAt: "2026-09-26T00:00:00.000Z",
  endsAt: "2026-09-26T01:30:00.000Z",
  pricePhp: 1000,
  capacity: 30,
  remainingSlots: 17,
  reservable: true,
  availability: "open",
  status: "PUBLISHED",
  venue: null,
  event: null,
};

const meta: Meta<typeof PublicBookingBar> = {
  title: "Balanse/Public/PublicBookingBar",
  component: PublicBookingBar,
  tags: ["autodocs"],
  args: { session, viewer: null, nowIso: "2026-09-16T02:50:00.000Z" },
  decorators: [(Story) => <div className="p-4">{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof PublicBookingBar>;

export const GuestBook: Story = {};
export const CustomerBook: Story = { args: { viewer: { customerId: "cust-ana" } } };
export const AlreadyBooked: Story = {
  args: { viewer: { customerId: "cust-ben" }, existingBookingId: "booking-community-pil-ben" },
};
export const Waitlist: Story = {
  args: { session: { ...session, availability: "full_with_waitlist", remainingSlots: 0 } },
};
export const PastCutoff: Story = { args: { session: { ...session, availability: "past_cutoff" } } };
export const RegistrationNotOpen: Story = {
  args: {
    registrationWindow: {
      registrationOpensAt: "2026-09-20T01:00:00.000Z",
      registrationClosesAt: null,
    },
  },
};
export const RegistrationClosed: Story = {
  args: {
    registrationWindow: {
      registrationOpensAt: null,
      registrationClosesAt: "2026-09-10T01:00:00.000Z",
    },
  },
};
export const Cancelled: Story = {
  args: { session: { ...session, status: "CANCELLED", availability: "cancelled" } },
};
export const Ended: Story = { args: { session: { ...session, availability: "past" } } };
