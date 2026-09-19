import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AspectRatio } from "./AspectRatio";

const meta: Meta<typeof AspectRatio> = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  args: {
    ...aspectRatioDefaultValues,
    ratio: 16 / 9,
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <AspectRatio {...args} className="overflow-hidden rounded-lg bg-muted">
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-coral/30 to-muted text-sm text-muted-foreground">
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: (args) => (
    <div className="w-64">
      <AspectRatio {...args} ratio={1} className="overflow-hidden rounded-lg bg-muted">
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-coral/20 to-muted text-sm text-muted-foreground">
          1:1
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  render: (args) => (
    <div className="w-64">
      <AspectRatio {...args} ratio={3 / 4} className="overflow-hidden rounded-lg bg-muted">
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-coral/25 to-muted text-sm text-muted-foreground">
          3:4
        </div>
      </AspectRatio>
    </div>
  ),
};

export const WithContent: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <AspectRatio {...args} className="overflow-hidden rounded-lg border bg-card">
        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
          Custom content inside a 16:9 container
        </div>
      </AspectRatio>
    </div>
  ),
};
