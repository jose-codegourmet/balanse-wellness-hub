import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => <Checkbox {...args} aria-label="Accept terms" />,
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  render: (args) => <Checkbox {...args} aria-label="Checked checkbox" />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <Checkbox {...args} aria-label="Disabled checkbox" />,
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
  render: (args) => <Checkbox {...args} aria-label="Disabled checked checkbox" />,
};
