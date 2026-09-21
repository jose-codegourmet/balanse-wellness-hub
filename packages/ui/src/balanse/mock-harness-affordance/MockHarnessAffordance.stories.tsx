import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MockHarnessAffordance } from "./MockHarnessAffordance";
import { mockHarnessAffordanceDefaultValues } from "./MockHarnessAffordance.defaults";

const meta: Meta<typeof MockHarnessAffordance> = {
  title: "Shared/MockHarnessAffordance",
  component: MockHarnessAffordance,
  tags: ["autodocs"],
  args: { ...mockHarnessAffordanceDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
