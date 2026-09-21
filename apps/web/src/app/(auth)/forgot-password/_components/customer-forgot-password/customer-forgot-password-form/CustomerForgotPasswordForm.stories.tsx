import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerForgotPasswordForm } from "./CustomerForgotPasswordForm";

const meta: Meta<typeof CustomerForgotPasswordForm> = {
  title: "Auth/Customer forgot-password form",
  component: CustomerForgotPasswordForm,
  tags: ["autodocs"],
  args: { email: "", error: "", onEmailChange: () => undefined, onSubmit: () => undefined },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
