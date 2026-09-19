import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BoldIcon } from "lucide-react";

import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};

export const Outline: Story = {
  render: (args) => (
    <Toggle {...args} variant="outline" aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <Toggle {...args} variant="outline">
      Enable notifications
    </Toggle>
  ),
};

export const Small: Story = {
  render: (args) => (
    <Toggle {...args} size="sm" variant="outline" aria-label="Toggle bold">
      <BoldIcon />
    </Toggle>
  ),
};
