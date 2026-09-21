import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminLoginForm } from "./AdminLoginForm";

const meta: Meta<typeof AdminLoginForm> = {
  title: "Admin/Admin login form",
  component: AdminLoginForm,
  tags: ["autodocs"],
  args: {
    email: "",
    password: "",
    errors: {},
    onEmailChange: () => undefined,
    onPasswordChange: () => undefined,
    onSubmit: () => undefined,
  },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
