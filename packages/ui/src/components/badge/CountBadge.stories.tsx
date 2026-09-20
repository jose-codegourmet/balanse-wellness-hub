import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CountBadge } from "./CountBadge";
import { countBadgeDefaultValues } from "./CountBadge.defaults";

const meta: Meta<typeof CountBadge> = {
  title: "Components/CountBadge",
  component: CountBadge,
  tags: ["autodocs"],
  args: { ...countBadgeDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overflow: Story = {
  args: {
    count: 142,
    max: 99,
    "aria-label": "142 pending items",
  },
};

export const StableRow: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-4">
      <CountBadge count={1} aria-label="1 pending booking" />
      <CountBadge count={12} aria-label="12 pending bookings" />
      <CountBadge count={99} aria-label="99 pending bookings" />
      <CountBadge count={128} aria-label="128 pending bookings" />
    </div>
  ),
};
