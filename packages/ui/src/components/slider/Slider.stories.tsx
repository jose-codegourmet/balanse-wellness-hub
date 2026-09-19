import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: (args) => <Slider {...args} className="max-w-sm" defaultValue={[33]} />,
};

export const WithValue: Story = {
  args: {
    defaultValue: [65],
  },
  render: (args) => (
    <div className="max-w-sm space-y-2">
      <Slider {...args} />
      <p className="text-sm text-muted-foreground">Volume: 65%</p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: [40],
    disabled: true,
  },
  render: (args) => <Slider {...args} className="max-w-sm" />,
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
  },
  render: (args) => <Slider {...args} className="max-w-sm" />,
};
