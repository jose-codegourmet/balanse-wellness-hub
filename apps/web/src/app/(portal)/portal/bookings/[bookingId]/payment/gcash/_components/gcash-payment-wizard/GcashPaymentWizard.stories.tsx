import type { CustomerBooking, PaymentInstructions } from "@balanse/domain";
import { bookings, paymentAccountFixtures, paymentInstructions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GcashPaymentWizard } from "./GcashPaymentWizard";

const fixture =
  bookings.find((booking) => booking.id === "booking-held_awaiting_payment") ?? bookings[1];

/** Fixture dates are pinned to September 2026; re-anchor the hold to "now". */
function held(overrides: Partial<CustomerBooking> = {}): CustomerBooking {
  const now = Date.now();
  const startsAt = new Date(now + 26 * 3_600_000);
  return {
    ...fixture,
    status: "HELD_AWAITING_PAYMENT",
    paymentMethod: "GCASH",
    paymentStatus: "NONE",
    holdExpiresAt: new Date(now + 2.25 * 3_600_000).toISOString(),
    session: {
      ...fixture.session,
      startsAt: startsAt.toISOString(),
      endsAt: new Date(startsAt.getTime() + 3_600_000).toISOString(),
    },
    ...overrides,
  };
}

/** Placeholder QR art so the story shows the real layout. Not a payable code. */
const PLACEHOLDER_QR = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" shape-rendering="crispEdges"><rect width="21" height="21" fill="#fff"/><path fill="#1c2430" d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0z"/><path fill="#fff" d="M1 1h5v5H1zM15 1h5v5h-5zM1 15h5v5H1z"/><path fill="#1c2430" d="M2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2zM9 1h2v2H9zM8 4h3v2H8zM9 8h3v3H9zM13 9h2v2h-2zM16 9h3v2h-3zM8 13h2v3H8zM12 13h3v2h-3zM16 13h2v4h-2zM11 17h3v3h-3zM19 18h2v3h-2z"/></svg>',
)}`;

const instructions: PaymentInstructions = {
  ...paymentInstructions,
  accounts: paymentAccountFixtures
    .filter((account) => account.isActive)
    .map(({ id, type, label, accountName, accountNumber, imageKey }) => ({
      id,
      type,
      label,
      accountName,
      accountNumber,
      imageKey: imageKey ? PLACEHOLDER_QR : null,
    })),
};

const meta = {
  title: "Customer/GcashPaymentWizard",
  component: GcashPaymentWizard,
  args: { booking: held(), instructions },
} satisfies Meta<typeof GcashPaymentWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendPayment: Story = {};
export const SingleAccount: Story = {
  args: { instructions: { ...instructions, accounts: instructions.accounts.slice(0, 1) } },
};
export const NoAccounts: Story = { args: { instructions: { ...instructions, accounts: [] } } };
export const DetailsUnavailable: Story = { args: { instructions: null } };
export const UploadReceipt: Story = { args: { forcedStep: "upload" } };
export const WaitingForFrontDesk: Story = {
  args: { booking: held({ status: "PAYMENT_SUBMITTED", paymentStatus: "PROOF_SUBMITTED" }) },
};
export const ReceiptRejected: Story = { args: { booking: held({ paymentStatus: "REJECTED" }) } };
export const Expired: Story = { args: { forcedExpired: true } };
