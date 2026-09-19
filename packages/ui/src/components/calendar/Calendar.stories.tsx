import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: (args) => <Calendar {...args} mode="single" />,
};

export const Range: Story = {
  render: (args) => <Calendar {...args} mode="range" numberOfMonths={2} />,
};

export const WithDropdown: Story = {
  render: (args) => (
    <Calendar
      {...args}
      mode="single"
      captionLayout="dropdown"
      defaultMonth={new Date(2026, 6, 1)}
    />
  ),
};

export const WithoutOutsideDays: Story = {
  render: (args) => <Calendar {...args} mode="single" showOutsideDays={false} />,
};
