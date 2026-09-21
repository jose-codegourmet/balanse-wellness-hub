import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "../binding-story/BindingStory";
import { TextareaBinding } from "./TextareaBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "A quiet morning practice." };

const meta = {
  title: "Admin/Components/Form/TextareaBinding",
  component: TextareaBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof TextareaBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Description">
      {(field) => <TextareaBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Description" invalid>
      {(field) => <TextareaBinding {...field} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Description" disabled>
      {(field) => <TextareaBinding {...field} />}
    </BindingStory>
  ),
};
