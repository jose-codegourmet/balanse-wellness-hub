import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
  render: (args) => <Input {...args} className="max-w-sm" />,
};

export const WithPlaceholder: Story = {
  args: {
    type: "email",
    placeholder: "name@example.com",
  },
  render: (args) => <Input {...args} className="max-w-sm" />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
    defaultValue: "Cannot edit",
  },
  render: (args) => <Input {...args} className="max-w-sm" />,
};

export const WithError: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "invalid-email",
    placeholder: "Email address",
  },
  render: (args) => <Input {...args} className="max-w-sm" />,
};
