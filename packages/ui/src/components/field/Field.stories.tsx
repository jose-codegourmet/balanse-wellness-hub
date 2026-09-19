import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "../input/Input";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "./Field";

const meta: Meta<typeof Field> = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: (args) => (
    <Field {...args} className="max-w-sm">
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" type="email" placeholder="you@example.com" />
      <FieldDescription>We will never share your email with anyone else.</FieldDescription>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <Field {...args} orientation="horizontal" className="max-w-md">
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <FieldContent>
        <Input id="username" placeholder="balanse" />
        <FieldDescription>Choose a unique username for your profile.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <Field {...args} className="max-w-sm" data-invalid="true">
      <FieldLabel htmlFor="password">Password</FieldLabel>
      <Input id="password" type="password" aria-invalid defaultValue="short" />
      <FieldError>Password must be at least 8 characters.</FieldError>
    </Field>
  ),
};

export const FieldSetExample: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend>Contact details</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="first-name">First name</FieldLabel>
          <Input id="first-name" placeholder="Alex" />
        </Field>
        <Field>
          <FieldLabel htmlFor="last-name">Last name</FieldLabel>
          <Input id="last-name" placeholder="Rivera" />
        </Field>
        <FieldSeparator>or</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
