import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PasswordInput } from "./PasswordInput";
import { passwordInputDefaultValues } from "./PasswordInput.defaults";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: { ...passwordInputDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: "short",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "hidden-value",
  },
};
