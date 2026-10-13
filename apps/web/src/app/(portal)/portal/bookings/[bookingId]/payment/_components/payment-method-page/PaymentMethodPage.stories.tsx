import type { CustomerBooking } from "@balanse/domain";
import { bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentMethodPage } from "./PaymentMethodPage";

const fixture =
  bookings.find((booking) => booking.id === "booking-held_awaiting_payment") ?? bookings[1];

/**
 * The fixture's dates are pinned to September 2026, so against the real clock
 * the hold has already lapsed. Re-anchor the class and hold to "now" so the
 * stories show a live hold.
 */
function heldBooking({ holdHours, classHours }: { holdHours: number; classHours: number }) {
  const now = Date.now();
  const startsAt = new Date(now + classHours * 3_600_000);
  const endsAt = new Date(startsAt.getTime() + 60 * 60_000);
  return {
    ...fixture,
    status: "HELD_AWAITING_PAYMENT",
    paymentMethod: null,
    paymentStatus: "NONE",
    holdExpiresAt: new Date(now + holdHours * 3_600_000).toISOString(),
    session: { ...fixture.session, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() },
  } satisfies CustomerBooking;
}

const held = heldBooking({ holdHours: 2.25, classHours: 26 });

const meta = {
  title: "Customer/PaymentMethod",
  component: PaymentMethodPage,
  args: { booking: held },
} satisfies Meta<typeof PaymentMethodPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** The hold would run past class start, so the deadline is the class start time. */
export const HoldCappedAtClassStart: Story = {
  args: { booking: heldBooking({ holdHours: 8, classHours: 0.75 }) },
};
export const PackageApplied: Story = {
  args: { booking: { ...held, entitlementId: "ent-ana-newbie", packageName: "Newbie Package" } },
};
export const Expired: Story = { args: { forcedExpired: true } };
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
