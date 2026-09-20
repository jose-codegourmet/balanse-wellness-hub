import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field, FieldContent, FieldDescription, FieldLabel } from "../field/Field";

import { Switch } from "./Switch";
import { switchDefaultValues } from "./Switch.defaults";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { ...switchDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Labelled: Story = {
  render: (args) => (
    <Field orientation="horizontal" className="max-w-md">
      <FieldContent>
        <FieldLabel>SMS reminders</FieldLabel>
        <FieldDescription>Send a text the morning of the session.</FieldDescription>
      </FieldContent>
      <Switch {...args} aria-label={undefined} />
    </Field>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Switch {...args} size="sm" aria-label="Small switch" />
      <Switch {...args} size="md" aria-label="Medium switch" />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};
