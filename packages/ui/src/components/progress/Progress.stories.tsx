import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Progress, ProgressLabel, ProgressValue } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 25,
  },
  render: (args) => (
    <Progress {...args} className="max-w-sm">
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};

export const Half: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <Progress {...args} className="max-w-sm">
      <ProgressLabel>Processing</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  render: (args) => (
    <Progress {...args} className="max-w-sm">
      <ProgressLabel>Complete</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};

export const WithoutLabel: Story = {
  args: {
    value: 72,
  },
  render: (args) => <Progress {...args} className="max-w-sm" />,
};
