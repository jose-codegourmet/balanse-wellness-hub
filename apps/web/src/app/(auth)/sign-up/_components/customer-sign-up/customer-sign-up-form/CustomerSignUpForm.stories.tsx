import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerSignUpForm } from "./CustomerSignUpForm";

const meta: Meta<typeof CustomerSignUpForm> = {
  title: "Auth/Customer sign-up form",
  component: CustomerSignUpForm,
  tags: ["autodocs"],
  args: {
    values: { fullName: "", email: "", contactNumber: "", password: "", confirmPassword: "" },
    errors: {},
    onChange: () => undefined,
    onSubmit: () => undefined,
  },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
