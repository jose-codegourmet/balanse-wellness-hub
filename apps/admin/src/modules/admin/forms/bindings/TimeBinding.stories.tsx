import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "./binding-story";
import { TimeBinding } from "./TimeBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "07:00" };

const meta = {
  title: "Admin/Components/Form/TimeBinding",
  component: TimeBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof TimeBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Start time" wireAria>
      {(field) => <TimeBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory
      schema={schema}
      defaultValues={{ value: "" }}
      label="Start time"
      wireAria
      autoSubmit
    >
      {(field) => <TimeBinding {...field} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Start time" wireAria disabled>
      {(field) => <TimeBinding {...field} />}
    </BindingStory>
  ),
};
