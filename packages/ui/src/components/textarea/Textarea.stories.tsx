import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
  },
  render: (args) => <Textarea {...args} className="max-w-md" />,
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Tell us about your project goals, timeline, and budget.",
  },
  render: (args) => <Textarea {...args} className="max-w-md" rows={4} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "This field is read-only and cannot be edited.",
  },
  render: (args) => <Textarea {...args} className="max-w-md" />,
};

export const WithValue: Story = {
  args: {
    defaultValue:
      "Thanks for reaching out! We received your message and will respond within one business day.",
  },
  render: (args) => <Textarea {...args} className="max-w-md" rows={4} />,
};
