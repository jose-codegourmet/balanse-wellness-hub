import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "../binding-story/BindingStory";
import { TagListBinding } from "./TagListBinding";

const schema = z.object({ value: z.array(z.string()).min(1, "Add at least one specialty.") });
const defaults = { value: ["Calisthenics", "Mat Pilates"] };

const meta = {
  title: "Admin/Components/Form/TagListBinding",
  component: TagListBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof TagListBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Specialties">
      {(field) => <TagListBinding {...field} />}
    </BindingStory>
  ),
};

export const Empty: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: [] }} label="Specialties">
      {(field) => <TagListBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: [] }} label="Specialties" invalid>
      {(field) => <TagListBinding {...field} />}
    </BindingStory>
  ),
};
