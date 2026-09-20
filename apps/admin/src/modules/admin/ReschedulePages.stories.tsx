import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RescheduleQueuePage } from "./ReschedulePages";

const meta = {
  title: "Admin/Screens/Reschedules",
  component: RescheduleQueuePage,
  tags: ["autodocs"],
} satisfies Meta<typeof RescheduleQueuePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const Queue: Story = {};
