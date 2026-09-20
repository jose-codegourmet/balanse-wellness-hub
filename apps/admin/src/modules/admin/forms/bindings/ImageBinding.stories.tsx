import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "./binding-story";
import { ImageBinding } from "./ImageBinding";

const schema = z.object({ value: z.string().nullable() });
const defaults = { value: null as string | null };

const meta = {
  title: "Admin/Components/Form/ImageBinding",
  component: ImageBinding,
  tags: ["autodocs"],
  args: {
    value: null,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
    label: "Coach photo",
    fallbackLabel: "No photo yet.",
  },
} satisfies Meta<typeof ImageBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Coach photo" wireAria>
      {(field) => (
        <ImageBinding
          {...field}
          label="Coach photo"
          fallbackLabel="No photo yet."
          photoKeyField="value"
        />
      )}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory
      schema={z.object({ value: z.string().min(1, "Upload a photo") })}
      defaultValues={{ value: "" }}
      label="Coach photo"
      wireAria
      autoSubmit
    >
      {(field) => (
        <ImageBinding
          {...field}
          label="Coach photo"
          fallbackLabel="No photo yet."
          photoKeyField="value"
        />
      )}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Coach photo" wireAria disabled>
      {(field) => (
        <ImageBinding
          {...field}
          label="Coach photo"
          fallbackLabel="No photo yet."
          photoKeyField="value"
        />
      )}
    </BindingStory>
  ),
};
