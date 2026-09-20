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
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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

export const TextVariant: Story = {
  render: () => <Skeleton variant="text" lines={3} className="max-w-sm" />,
};

export const HeadingVariant: Story = {
  render: () => <Skeleton variant="heading" />,
};

export const CircleVariant: Story = {
  render: () => <Skeleton variant="circle" />,
};

export const RectVariant: Story = {
  render: () => <Skeleton variant="rect" aspect="16 / 9" className="max-w-sm" />,
};

export const BlockVariant: Story = {
  render: () => <Skeleton variant="block" className="max-w-sm" />,
};

export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Storybook cannot force `prefers-reduced-motion`. This story applies a local override so reviewers can inspect the static bars. Confirm the real `motion-safe:animate-pulse` rule in the OS reduced-motion setting.",
      },
    },
  },
  render: () => (
    <div className="skeleton-reduced-motion max-w-sm space-y-3">
      <style>{".skeleton-reduced-motion [data-slot='skeleton']{animation:none!important}"}</style>
      <Skeleton className="h-4 w-[240px]" />
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};
