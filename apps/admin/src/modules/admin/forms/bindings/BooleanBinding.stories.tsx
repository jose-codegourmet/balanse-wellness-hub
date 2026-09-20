import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BooleanBinding } from "./BooleanBinding";
import { BindingStory } from "./binding-story";

const schema = z.object({ value: z.literal(true, { error: "Must be active" }) });
const defaults = { value: true };

const meta = {
  title: "Admin/Components/Form/BooleanBinding",
  component: BooleanBinding,
  tags: ["autodocs"],
  args: {
    value: true,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof BooleanBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Active" orientation="horizontal">
      {(field) => <BooleanBinding {...field} as="switch" />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory
      schema={schema}
      defaultValues={{ value: false }}
      label="Active"
      orientation="horizontal"
      invalid
    >
      {(field) => <BooleanBinding {...field} as="checkbox" />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory
      schema={schema}
      defaultValues={defaults}
      label="Active"
      orientation="horizontal"
      disabled
    >
      {(field) => <BooleanBinding {...field} as="switch" />}
    </BindingStory>
  ),
};
