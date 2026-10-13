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
      profileId: "cust-empty",
      bundleId: "bundle-newbie",
      name: "Newbie Package",
      sessionCreditCount: 12,
      pricePhp: 0,
      applicabilityMode: "ALL_ACTIVE_CLASSES",
      classIds: [],
      validityDays: null,
      balances: { granted: 12, remaining: 12, held: 0, consumed: 0, restored: 0 },
      status: "ACTIVE",
      expiresAt: null,
      revokedAt: null,
      revokeReason: null,
      grantedAt: "2026-08-20T00:00:00.000Z",
      acquisition: null,
    },
    redemptions: [],
  },
};
