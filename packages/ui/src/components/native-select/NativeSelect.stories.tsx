import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./NativeSelect";

const meta: Meta<typeof NativeSelect> = {
  title: "Components/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

export const Default: Story = {
  render: (args) => (
    <NativeSelect {...args} defaultValue="medium">
      <NativeSelectOption value="small">Small</NativeSelectOption>
      <NativeSelectOption value="medium">Medium</NativeSelectOption>
      <NativeSelectOption value="large">Large</NativeSelectOption>
    </NativeSelect>
  ),
};

export const Small: Story = {
  render: (args) => (
    <NativeSelect {...args} size="sm" defaultValue="weekly">
      <NativeSelectOption value="daily">Daily</NativeSelectOption>
      <NativeSelectOption value="weekly">Weekly</NativeSelectOption>
      <NativeSelectOption value="monthly">Monthly</NativeSelectOption>
    </NativeSelect>
  ),
};

export const Grouped: Story = {
  render: (args) => (
    <NativeSelect {...args} defaultValue="dog">
      <NativeSelectOptGroup label="Pets">
        <NativeSelectOption value="dog">Dog</NativeSelectOption>
        <NativeSelectOption value="cat">Cat</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Other">
        <NativeSelectOption value="bird">Bird</NativeSelectOption>
        <NativeSelectOption value="rabbit">Rabbit</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};
