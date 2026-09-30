import { EMPTY_BUNDLE_CREDIT_METRICS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BundleCreditMetrics } from "./BundleCreditMetrics";

const meta = {
  title: "Admin/Components/BundleCreditMetrics",
  component: BundleCreditMetrics,
} satisfies Meta<typeof BundleCreditMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InUse: Story = {
  args: { metrics: { granted: 24, held: 3, used: 11, restored: 2, owners: 3 } },
};

export const NoOwners: Story = {
  args: { metrics: EMPTY_BUNDLE_CREDIT_METRICS },
};
