import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerSignUp } from "./CustomerSignUp";

/**
 * The route passes the `createCustomerAccount` server action, which reads the
 * share-attribution cookie, creates the mock customer and clears the cookie.
 * Stories stub it so nothing leaves the canvas.
 */
const meta = {
  title: "Customer/SignUp",
  component: CustomerSignUp,
  args: {
    returnTo: "/sessions/reformer-pilates/2026-10-04/session-1",
    createAccount: async () => ({ ok: true, customerId: "cust-story" }),
  },
} satisfies Meta<typeof CustomerSignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
export const AccountFailed: Story = {
  args: {
    createAccount: async () => ({
      ok: false,
      error: "We couldn't create your account. Try again.",
    }),
  },
};
