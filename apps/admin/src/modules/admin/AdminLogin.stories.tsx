import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminLogin } from "./AdminLogin";

const meta = {
  title: "Admin/Screens/Login",
  component: AdminLogin,
  tags: ["autodocs"],
} satisfies Meta<typeof AdminLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
export const InvalidCredentials: Story = { args: { forcedStatus: "invalid" } };
export const NotAdmin: Story = { args: { forcedStatus: "not-admin" } };
