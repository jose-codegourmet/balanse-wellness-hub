import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InsightsShareSplit } from "./InsightsShareSplit";

const meta = {
  title: "Admin/Marketing insights/Share split",
  component: InsightsShareSplit,
  tags: ["autodocs"],
  args: {
    total: 12,
    segments: [
      { key: "customer", label: "Customer referrals", count: 3 },
      { key: "studio", label: "Studio marketing", count: 2 },
      { key: "none", label: "No shared link", count: 7 },
    ],
  },
} satisfies Meta<typeof InsightsShareSplit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};

export const AllOrganic: Story = {
  args: {
    total: 4,
    segments: [
      { key: "customer", label: "Customer referrals", count: 0 },
      { key: "studio", label: "Studio marketing", count: 0 },
      { key: "none", label: "No shared link", count: 4 },
    ],
  },
};
