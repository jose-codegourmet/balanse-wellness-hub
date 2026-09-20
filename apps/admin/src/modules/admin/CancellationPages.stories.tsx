import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CancellationQueuePage } from "./CancellationPages";

const meta = {
  title: "Admin/Screens/Cancellations",
  component: CancellationQueuePage,
  tags: ["autodocs"],
} satisfies Meta<typeof CancellationQueuePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const Queue: Story = {};
