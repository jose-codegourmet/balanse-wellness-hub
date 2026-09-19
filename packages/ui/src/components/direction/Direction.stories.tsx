import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button/Button";

import { DirectionProvider } from "./Direction";

const meta: Meta<typeof DirectionProvider> = {
  title: "Components/Direction",
  component: DirectionProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DirectionProvider>;

export const Default: Story = {
  render: (args) => (
    <DirectionProvider {...args}>
      <div className="flex max-w-sm items-center justify-between rounded-xl border p-4">
        <span className="text-sm">Left to right layout</span>
        <Button size="sm" variant="outline">
          Action
        </Button>
      </div>
    </DirectionProvider>
  ),
};

export const RightToLeft: Story = {
  args: {
    direction: "rtl",
  },
  render: (args) => (
    <DirectionProvider {...args}>
      <div className="flex max-w-sm items-center justify-between rounded-xl border p-4">
        <span className="text-sm">Right to left layout</span>
        <Button size="sm" variant="outline">
          Action
        </Button>
      </div>
    </DirectionProvider>
  ),
};

export const WithMixedContent: Story = {
  render: (args) => (
    <div className="grid max-w-2xl gap-4 md:grid-cols-2">
      <DirectionProvider {...args} direction="ltr">
        <div className="rounded-xl border p-4">
          <p className="mb-2 text-sm font-medium">LTR</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Start</span>
            <Button size="sm" variant="outline">
              Next
            </Button>
          </div>
        </div>
      </DirectionProvider>
      <DirectionProvider direction="rtl">
        <div className="rounded-xl border p-4">
          <p className="mb-2 text-sm font-medium">RTL</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Start</span>
            <Button size="sm" variant="outline">
              Next
            </Button>
          </div>
        </div>
      </DirectionProvider>
    </div>
  ),
};
