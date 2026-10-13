import type { HttpBundleAcquisition } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AcquisitionPaymentPage } from "./AcquisitionPaymentPage";

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
  payment: null,
  entitlementId: null,
};

const meta = {
  title: "Portal/Packages/AcquisitionPaymentPage",
  component: AcquisitionPaymentPage,
  args: {
    customerId: "story-customer",
    acquisition,
    summary: {
      name: "Reformer 10-pack",
      sessionCreditCount: 10,
      validityDays: 90,
      pricePhp: 4800,
    },
  },
} satisfies Meta<typeof AcquisitionPaymentPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoExpiry: Story = {
  args: {
    summary: { name: "Mat 5-pack", sessionCreditCount: 5, validityDays: null, pricePhp: 2000 },
  },
};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
