import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./Skeleton";
import { skeletonDefaultValues } from "./Skeleton.defaults";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    ...skeletonDefaultValues,
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: (args) => <Skeleton {...args} className="h-4 w-[240px]" />,
};

export const Circle: Story = {
  render: (args) => <Skeleton {...args} className="size-12 rounded-full" />,
};

export const TextBlock: Story = {
  render: (args) => (
    <div className="flex max-w-sm items-center gap-4">
      <Skeleton {...args} className="size-12 shrink-0 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: (args) => (
    <div className="w-[320px] space-y-3 rounded-xl border p-4">
      <Skeleton {...args} className="h-[140px] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};
