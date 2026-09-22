import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EntitlementDetailPage } from "./EntitlementDetailPage";

const meta = {
  title: "Customer/EntitlementDetail",
  component: EntitlementDetailPage,
  tags: ["autodocs"],
} satisfies Meta<typeof EntitlementDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyHistory: Story = {
  args: {
    entitlement: {
      id: "ent-demo",
      customerId: "cust-empty",
      bundleId: "bundle-newbie",
      acquisitionId: "acq-demo",
      snapshot: {
        name: "Newbie Package",
        sessionCredits: 12,
        pricePhp: 0,
        applicability: { allActiveClasses: true, classIds: [] },
        validityDays: null,
      },
      grantedCredits: 12,
      remainingCredits: 12,
      heldCredits: 0,
      consumedCredits: 0,
      restoredCredits: 0,
      status: "ACTIVE",
      expiresAt: null,
      revokedAt: null,
      createdAt: "2026-08-20T00:00:00.000Z",
    },
    redemptions: [],
  },
};
