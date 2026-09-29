import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminQueueCount } from "./AdminQueueCount";

const meta: Meta<typeof AdminQueueCount> = {
  title: "Admin/Components/AdminQueueCount",
  component: AdminQueueCount,
  tags: ["autodocs"],
  args: { count: 12, label: "open requests" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { count: 0 } };
