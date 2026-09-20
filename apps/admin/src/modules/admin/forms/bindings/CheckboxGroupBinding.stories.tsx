import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "./binding-story";
import { CheckboxGroupBinding } from "./CheckboxGroupBinding";

const schema = z.object({ value: z.array(z.string()).min(1, "Pick at least one coach") });
const defaults = { value: ["coach-1"] };
const options = [
  { value: "coach-1", label: "Maya Santos" },
  { value: "coach-2", label: "Leo Cruz" },
];

const meta = {
  title: "Admin/Components/Form/CheckboxGroupBinding",
  component: CheckboxGroupBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
    options,
  },
} satisfies Meta<typeof CheckboxGroupBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Associated coaches">
      {(field) => <CheckboxGroupBinding {...field} options={options} />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory
      schema={schema}
      defaultValues={{ value: [] }}
      label="Associated coaches"
      autoSubmit
    >
      {(field) => <CheckboxGroupBinding {...field} options={options} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Associated coaches" disabled>
      {(field) => <CheckboxGroupBinding {...field} options={options} />}
    </BindingStory>
  ),
};
