import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerSignUp } from "./CustomerSignUp";

const meta = {
  title: "Customer/SignUp",
  component: CustomerSignUp,
} satisfies Meta<typeof CustomerSignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
