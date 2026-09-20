import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentReviewPage } from "./PaymentPages";

const meta = {
  title: "Admin/Screens/Payments",
  component: PaymentReviewPage,
  tags: ["autodocs"],
} satisfies Meta<typeof PaymentReviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const Queue: Story = {};
