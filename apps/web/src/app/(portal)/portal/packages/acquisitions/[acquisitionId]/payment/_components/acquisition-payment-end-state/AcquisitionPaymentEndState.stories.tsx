import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AcquisitionPaymentEndState } from "./AcquisitionPaymentEndState";

const meta = {
  title: "Portal/Packages/AcquisitionPaymentEndState",
  component: AcquisitionPaymentEndState,
  args: { kind: "closed" },
} satisfies Meta<typeof AcquisitionPaymentEndState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Approved: Story = {
  args: { kind: "approved", entitlementId: "entitlement-1", name: "Reformer 10-pack" },
};
