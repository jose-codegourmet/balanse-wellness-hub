import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "../field/Field";

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
    <div className="grid max-w-md gap-4">
      <Field orientation="horizontal">
        <Checkbox {...args} aria-label={undefined} />
        <FieldContent>
          <FieldLabel>Email me about waitlist openings</FieldLabel>
          <FieldDescription>We only send one message per class.</FieldDescription>
        </FieldContent>
      </Field>
      <FieldLabel>
        <Field orientation="horizontal">
          <Checkbox defaultChecked aria-label={undefined} />
          <FieldContent>
            <FieldTitle>SMS reminders</FieldTitle>
            <FieldDescription>
              Opt in to session reminders. Checked card styles apply.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
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
