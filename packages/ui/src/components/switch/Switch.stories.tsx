import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => <Switch {...args} aria-label="Toggle setting" />,
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  render: (args) => <Switch {...args} aria-label="Checked switch" />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <Switch {...args} aria-label="Disabled switch" />,
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
  render: (args) => <Switch {...args} aria-label="Disabled checked switch" />,
};
