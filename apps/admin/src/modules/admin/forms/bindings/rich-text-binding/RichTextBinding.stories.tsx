import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "../binding-story/BindingStory";
import { RichTextBinding } from "./RichTextBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "A **quiet** morning practice." };

const meta = {
  title: "Admin/Components/Form/RichTextBinding",
  component: RichTextBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof RichTextBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Bio" wireAria>
      {(field) => <RichTextBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Bio" wireAria invalid>
      {(field) => <RichTextBinding {...field} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Bio" wireAria disabled>
      {(field) => <RichTextBinding {...field} />}
    </BindingStory>
  ),
};
