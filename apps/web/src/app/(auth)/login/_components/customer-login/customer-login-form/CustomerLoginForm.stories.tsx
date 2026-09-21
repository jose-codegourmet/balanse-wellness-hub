import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerLoginForm } from "./CustomerLoginForm";

const meta: Meta<typeof CustomerLoginForm> = {
  title: "Auth/Customer login form",
  component: CustomerLoginForm,
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
