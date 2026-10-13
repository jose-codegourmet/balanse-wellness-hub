import type { PaymentInstructions } from "@balanse/domain";
import { paymentAccountFixtures, paymentInstructions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GcashPayStep } from "./GcashPayStep";

/** Placeholder QR art so the story shows the real layout. Not a payable code. */
const PLACEHOLDER_QR = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" shape-rendering="crispEdges"><rect width="21" height="21" fill="#fff"/><path fill="#1c2430" d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0z"/><path fill="#fff" d="M1 1h5v5H1zM15 1h5v5h-5zM1 15h5v5H1z"/><path fill="#1c2430" d="M2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2z"/></svg>',
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
  title: "Portal/GCash pay step",
  component: GcashPayStep,
  args: {
    instructions,
    amountLabel: "₱4,800.00",
    counterHref: "#",
    onSent: () => undefined,
  },
} satisfies Meta<typeof GcashPayStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoAccounts: Story = { args: { instructions: { ...instructions, accounts: [] } } };
export const DetailsUnavailable: Story = { args: { instructions: null } };
