import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field, FieldContent, FieldDescription, FieldLabel, FieldSet } from "../field/Field";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";
import { radioGroupDefaultValues } from "./RadioGroup.defaults";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { ...radioGroupDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Field orientation="horizontal">
        <RadioGroupItem value="default" />
        <FieldLabel>Default</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="comfortable" />
        <FieldLabel>Comfortable</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="compact" />
        <FieldLabel>Compact</FieldLabel>
      </Field>
    </RadioGroup>
  ),
};

export const Labelled: Story = {
  render: (args) => (
    <FieldSet className="max-w-sm">
      <Field invalid={false}>
        <FieldLabel>Billing period</FieldLabel>
        <FieldDescription>Arrow keys move between options.</FieldDescription>
        <RadioGroup {...args} defaultValue="monthly">
          <Field orientation="horizontal">
            <RadioGroupItem value="monthly" />
            <FieldContent>
              <FieldLabel>Monthly</FieldLabel>
              <FieldDescription>Billed every month. Cancel anytime.</FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="yearly" />
            <FieldContent>
              <FieldLabel>Yearly</FieldLabel>
              <FieldDescription>Save 20% with annual billing.</FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
      </Field>
    </FieldSet>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: undefined,
  },
  render: (args) => (
    <Field invalid>
      <FieldLabel>Density</FieldLabel>
      <RadioGroup {...args}>
        <Field orientation="horizontal">
          <RadioGroupItem value="default" />
          <FieldLabel>Default</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="comfortable" />
          <FieldLabel>Comfortable</FieldLabel>
        </Field>
      </RadioGroup>
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Field orientation="horizontal">
        <RadioGroupItem value="comfortable" />
        <FieldLabel>Comfortable</FieldLabel>
      </Field>
    </RadioGroup>
  ),
};
