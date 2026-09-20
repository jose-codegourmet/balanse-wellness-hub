import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./Input";
import { inputDefaultValues } from "./Input.defaults";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { ...inputDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <Input {...args} size="sm" placeholder="Small" />
      <Input {...args} size="md" placeholder="Medium" />
      <Input {...args} size="lg" placeholder="Large" />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: "invalid-email",
    placeholder: "Email address",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Cannot edit",
    placeholder: "Disabled input",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "Mon–Fri 7:00–20:00",
  },
};
