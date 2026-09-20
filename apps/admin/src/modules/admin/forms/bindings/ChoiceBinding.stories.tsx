import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "./binding-story";
import { ChoiceBinding } from "./ChoiceBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "PER_SESSION" };
const options = [
  { value: "PER_SESSION", label: "Per session" },
  { value: "PER_HOUR", label: "Per hour" },
];

const meta = {
  title: "Admin/Components/Form/ChoiceBinding",
  component: ChoiceBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
    options,
  },
} satisfies Meta<typeof ChoiceBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Rate type">
      {(field) => <ChoiceBinding {...field} options={options} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Rate type" autoSubmit>
      {(field) => <ChoiceBinding {...field} as="radio" options={options} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Rate type" disabled>
      {(field) => <ChoiceBinding {...field} as="select" options={options} />}
    </BindingStory>
  ),
};
