import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: (args) => <Separator {...args} className="max-w-sm" />,
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <div className="flex h-20 items-center gap-4">
      <span className="text-sm">Left</span>
      <Separator {...args} />
      <span className="text-sm">Right</span>
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex max-w-sm items-center gap-4">
      <span className="shrink-0 text-sm text-muted-foreground">Section A</span>
      <Separator {...args} className="flex-1" />
      <span className="shrink-0 text-sm text-muted-foreground">Section B</span>
    </div>
  ),
};

export const InList: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-4">
      <div>
        <p className="text-sm font-medium">Account</p>
        <p className="text-sm text-muted-foreground">Manage profile settings</p>
      </div>
      <Separator {...args} />
      <div>
        <p className="text-sm font-medium">Billing</p>
        <p className="text-sm text-muted-foreground">Invoices and payment methods</p>
      </div>
    </div>
  ),
};
