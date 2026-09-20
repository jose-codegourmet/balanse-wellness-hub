import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../button/Button";
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
import { fieldDefaultValues } from "./Field.defaults";

const meta: Meta<typeof Field> = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  args: { ...fieldDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Email</FieldLabel>
      <Input type="email" placeholder="you@example.com" />
      <FieldDescription>We will never share your email with anyone else.</FieldDescription>
    </Field>
  ),
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    className: "max-w-md",
  },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Username</FieldLabel>
      <FieldContent>
        <Input placeholder="balanse" />
        <FieldDescription>Choose a unique username for your profile.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Password</FieldLabel>
      <Input type="password" defaultValue="short" />
      <FieldError>Password must be at least 8 characters.</FieldError>
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Studio name</FieldLabel>
      <Input defaultValue="Balansé Wellness Hub" />
      <FieldDescription>Disabled fields inherit opacity from Field.</FieldDescription>
    </Field>
  ),
};

export const FieldSetExample: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend>Contact details</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel>First name</FieldLabel>
          <Input placeholder="Alex" />
        </Field>
        <Field>
          <FieldLabel>Last name</FieldLabel>
          <Input placeholder="Rivera" />
        </Field>
        <FieldSeparator>or</FieldSeparator>
        <Field>
          <FieldLabel>Phone</FieldLabel>
          <Input type="tel" placeholder="+1 (555) 000-0000" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

const rhfSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type RhfValues = z.infer<typeof rhfSchema>;

function ReactHookFormExample() {
  const form = useForm<RhfValues>({
    resolver: zodResolver(rhfSchema),
    defaultValues: { email: "" },
  });

  return (
    <form className="max-w-sm space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
      <Field invalid={Boolean(form.formState.errors.email)}>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" placeholder="you@example.com" {...form.register("email")} />
        <FieldDescription>Validation errors come from react-hook-form.</FieldDescription>
        <FieldError errors={[form.formState.errors.email]} />
      </Field>
      <Button type="submit">Check email</Button>
    </form>
  );
}

export const ReactHookForm: Story = {
  render: () => <ReactHookFormExample />,
};
