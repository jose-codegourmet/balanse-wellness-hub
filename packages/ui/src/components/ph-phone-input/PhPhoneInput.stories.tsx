import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhPhoneInput } from "./PhPhoneInput";
import { phPhoneInputDefaultValues } from "./PhPhoneInput.defaults";

const meta: Meta<typeof PhPhoneInput> = {
  title: "Components/PhPhoneInput",
  component: PhPhoneInput,
  tags: ["autodocs"],
  args: { ...phPhoneInputDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: "+63 917 000 0001",
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: "09",
  },
};
