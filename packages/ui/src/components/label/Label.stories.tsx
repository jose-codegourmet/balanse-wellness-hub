import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "../input/Input";

import { Label } from "./Label";
import { labelDefaultValues } from "./Label.defaults";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  args: { ...labelDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label {...args} />
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label {...args} htmlFor="required-email">
        Email address <span className="text-destructive">*</span>
      </Label>
      <Input id="required-email" type="email" placeholder="name@example.com" required />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2" data-disabled="true">
      <Label {...args} htmlFor="disabled-email">
        Email address
      </Label>
      <Input id="disabled-email" type="email" disabled placeholder="Disabled field" />
    </div>
  ),
};
