import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarFallback } from "../avatar/Avatar";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "../field/Field";
import { Checkbox, CheckboxGroup, CheckboxGroupItem } from "./Checkbox";
import { checkboxDefaultValues } from "./Checkbox.defaults";

function CoachMark({ initials }: { initials: string }) {
  return (
    <Avatar size="sm" className="size-7">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

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

export const RichGroup: Story = {
  render: () => (
    <CheckboxGroup className="max-w-sm" aria-label="Associated coaches">
      <CheckboxGroupItem
        label="Maya Santos"
        leading={<CoachMark initials="MS" />}
        description="Reformer · senior"
        defaultChecked
      />
      <CheckboxGroupItem
        label="Lina Cruz"
        leading={<CoachMark initials="LC" />}
        description="Tower · weekend"
      />
      <CheckboxGroupItem label="Plain option" />
    </CheckboxGroup>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const RichGroupDark: Story = {
  render: () => (
    <div className="dark bg-background p-4 text-foreground">
      <CheckboxGroup className="max-w-sm" aria-label="Associated coaches">
        <CheckboxGroupItem
          label="Maya Santos"
          leading={<CoachMark initials="MS" />}
          description="Reformer · senior"
          defaultChecked
        />
        <CheckboxGroupItem
          label="Lina Cruz"
          leading={<CoachMark initials="LC" />}
          description="Tower · weekend"
        />
      </CheckboxGroup>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
