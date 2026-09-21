import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { z } from "zod";
import { BindingStory } from "../binding-story/BindingStory";
import { ComboboxBinding } from "./ComboboxBinding";

const schema = z.object({ value: z.string().min(1, "Required") });
const defaults = { value: "class-yoga" };
const options = [
  { value: "class-yoga", label: "Yoga" },
  { value: "class-pilates", label: "Pilates" },
  { value: "class-kickboxing", label: "Kickboxing" },
];

const meta = {
  title: "Admin/Components/Form/ComboboxBinding",
  component: ComboboxBinding,
  tags: ["autodocs"],
  args: {
    value: defaults.value,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "value",
    ref: () => undefined,
    options,
  },
} satisfies Meta<typeof ComboboxBinding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Class">
      {(field) => <ComboboxBinding {...field} options={options} placeholder="Search class…" />}
    </BindingStory>
  ),
};

export const Invalid: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={{ value: "" }} label="Class" invalid>
      {(field) => <ComboboxBinding {...field} options={options} />}
    </BindingStory>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BindingStory schema={schema} defaultValues={defaults} label="Class" disabled>
      {(field) => <ComboboxBinding {...field} options={options} />}
    </BindingStory>
  ),
};
