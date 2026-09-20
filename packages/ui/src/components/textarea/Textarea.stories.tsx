import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./Textarea";
import { textareaDefaultValues } from "./Textarea.defaults";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { ...textareaDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="grid max-w-md gap-3">
      <Textarea {...args} size="sm" placeholder="Small" />
      <Textarea {...args} size="md" placeholder="Medium" />
      <Textarea {...args} size="lg" placeholder="Large" />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: "Too short.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "This field cannot be edited.",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "Opening hours are managed by the studio and cannot be edited here.",
  },
};

export const AutoResize: Story = {
  args: {
    autoResize: true,
    defaultValue: "Type more lines and the field grows with the content.",
  },
};
