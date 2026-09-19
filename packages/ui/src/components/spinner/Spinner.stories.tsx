import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  render: (args) => <Spinner {...args} />,
};

export const Large: Story = {
  args: {
    className: "size-8",
  },
  render: (args) => <Spinner {...args} />,
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Spinner {...args} />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  ),
};

export const Small: Story = {
  args: {
    className: "size-3",
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Spinner {...args} />
      <span className="text-xs text-muted-foreground">Please wait</span>
    </div>
  ),
};
