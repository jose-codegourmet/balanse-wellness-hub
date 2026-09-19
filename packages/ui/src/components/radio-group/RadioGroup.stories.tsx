import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Label } from "../label/Label";

import { RadioGroup, RadioGroupItem } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="comfortable">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="rg-default" />
        <Label htmlFor="rg-default">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="rg-comfortable" />
        <Label htmlFor="rg-comfortable">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="compact" id="rg-compact" />
        <Label htmlFor="rg-compact">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="monthly" className="max-w-sm gap-3">
      <div className="flex items-start gap-2">
        <RadioGroupItem value="monthly" id="rg-monthly" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="rg-monthly">Monthly</Label>
          <p className="text-sm text-muted-foreground">Billed every month. Cancel anytime.</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="yearly" id="rg-yearly" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="rg-yearly">Yearly</Label>
          <p className="text-sm text-muted-foreground">Save 20% with annual billing.</p>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="available" className="max-w-sm">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="available" id="rg-available" />
        <Label htmlFor="rg-available">Available</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="unavailable" id="rg-unavailable" disabled />
        <Label htmlFor="rg-unavailable" className="opacity-50">
          Unavailable
        </Label>
      </div>
    </RadioGroup>
  ),
};
