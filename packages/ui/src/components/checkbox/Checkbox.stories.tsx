import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field, FieldContent, FieldDescription, FieldLabel } from "../field/Field";

import { Checkbox } from "./Checkbox";
import { checkboxDefaultValues } from "./Checkbox.defaults";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { ...checkboxDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Labelled: Story = {
  render: (args) => (
    <Field orientation="horizontal" className="max-w-md">
      <Checkbox {...args} aria-label={undefined} />
      <FieldContent>
        <FieldLabel>Email me about waitlist openings</FieldLabel>
        <FieldDescription>We only send one message per class.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    "aria-label": "Select all bookings",
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Field orientation="horizontal" invalid className="max-w-md">
      <Checkbox {...args} aria-label={undefined} />
      <FieldContent>
        <FieldLabel>Accept the studio waiver</FieldLabel>
        <FieldDescription>Required before the first booking.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};
