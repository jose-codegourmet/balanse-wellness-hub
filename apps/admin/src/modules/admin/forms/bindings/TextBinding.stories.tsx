import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "./binding-story";
import { TextBinding } from "./TextBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "Vinyasa Flow" };

const meta = {
  title: "Admin/Components/Form/TextBinding",
  component: TextBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
  },
} satisfies Meta<typeof TextBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Name">
      {(field) => <TextBinding {...field} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Name" autoSubmit>
      {(field) => <TextBinding {...field} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Name" disabled>
      {(field) => <TextBinding {...field} />}
    </BindingStory>
  ),
};
