import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "./binding-story";
import { DateBinding } from "./DateBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "2026-09-20" };

const meta = {
  title: "Admin/Components/Form/DateBinding",
  component: DateBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof DateBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Date" wireAria>
      {(field) => <DateBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Date" wireAria invalid>
      {(field) => <DateBinding {...field} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Date" wireAria disabled>
      {(field) => <DateBinding {...field} />}
    </BindingStory>
  ),
};
