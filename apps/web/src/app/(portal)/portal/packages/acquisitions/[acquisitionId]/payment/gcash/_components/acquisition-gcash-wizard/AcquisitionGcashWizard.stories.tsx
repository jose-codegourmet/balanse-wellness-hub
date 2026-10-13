import type { HttpBundleAcquisition, PaymentInstructions } from "@balanse/domain";
import { paymentAccountFixtures, paymentInstructions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AcquisitionGcashWizard } from "./AcquisitionGcashWizard";

const acquisition: HttpBundleAcquisition = {
  id: "acq-story",
  bundleId: "bundle-story",
  profileId: "story-customer",
  kind: "CUSTOMER_PAID",
  status: "PENDING_PAYMENT",
  idempotencyKey: "key",
  overrideLimit: false,
  overrideReason: null,
  adminNote: null,
  rejectionNote: null,
  createdAt: "2026-10-03T00:00:00.000Z",
  reviewedAt: null,
  payment: {
    id: "payment-story",
    method: "GCASH",
    status: "NONE",
    amountPhp: 4800,
    proofObjectKey: null,
    submittedAt: null,
  },
  entitlementId: null,
};

const instructions: PaymentInstructions = {
  ...paymentInstructions,
  accounts: paymentAccountFixtures
    .filter((account) => account.isActive)
    .map(({ id, type, label, accountName, accountNumber }) => ({
      id,
      type,
      label,
      accountName,
      accountNumber,
      imageKey: null,
    })),
};

const meta = {
  title: "Portal/Packages/AcquisitionGcashWizard",
  component: AcquisitionGcashWizard,
  args: {
    customerId: "story-customer",
    acquisition,
    summary: { name: "Reformer 10-pack", sessionCreditCount: 10, validityDays: 90, pricePhp: 4800 },
    instructions,
  },
} satisfies Meta<typeof AcquisitionGcashWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SendPayment: Story = {};
export const DetailsUnavailable: Story = { args: { instructions: null } };
export const UploadReceipt: Story = { args: { forcedStep: "upload" } };
export const WaitingForStudio: Story = {
  args: {
    acquisition: {
      ...acquisition,
      status: "PENDING_REVIEW",
      payment: acquisition.payment && { ...acquisition.payment, status: "PROOF_SUBMITTED" },
    },
  },
};
