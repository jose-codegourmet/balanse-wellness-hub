import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerLogin } from "./CustomerLogin";

const meta = {
  title: "Customer/Login",
  component: CustomerLogin,
  // The route passes the Supabase `signInWithPassword` server action.
  args: { signIn: async () => ({ ok: true }) },
} satisfies Meta<typeof CustomerLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
export const InvalidCredentials: Story = { args: { forcedStatus: "invalid" } };
export const GoogleFailed: Story = { args: { authError: "callback" } };
