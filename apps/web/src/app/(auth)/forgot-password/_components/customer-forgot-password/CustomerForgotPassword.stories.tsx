import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerForgotPassword } from "./CustomerForgotPassword";

const meta = {
  title: "Customer/ForgotPassword",
  component: CustomerForgotPassword,
} satisfies Meta<typeof CustomerForgotPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = { args: { forcedView: "initial" } };
export const Submitted: Story = { args: { forcedView: "submitted" } };
export const InvalidEmail: Story = { args: { forcedView: "invalid" } };
export const ExpiredLink: Story = { args: { forcedView: "expired" } };
