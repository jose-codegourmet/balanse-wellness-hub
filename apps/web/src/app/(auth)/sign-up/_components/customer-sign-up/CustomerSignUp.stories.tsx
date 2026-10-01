import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomerSignUp } from "./CustomerSignUp";

/**
 * The route passes the `createCustomerAccount` server action, which signs the
 * customer up with Supabase Auth (or finishes a Google sign-up), reads and
 * clears the share-attribution cookie. Stories stub it so nothing leaves the
 * canvas.
 */
const meta = {
  title: "Customer/SignUp",
  component: CustomerSignUp,
  args: {
    returnTo: "/sessions/reformer-pilates/2026-10-04/session-1",
    createAccount: async () => ({ ok: true, next: "welcome" }),
  },
} satisfies Meta<typeof CustomerSignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
export const ConfirmEmail: Story = { args: { forcedStatus: "confirm_email" } };
export const FinishGoogleSignUp: Story = {
  args: {
    googleIdentity: { givenName: "Gia", familyName: "Ramos", email: "gia.ramos@example.com" },
  },
};
export const AccountFailed: Story = {
  args: {
    createAccount: async () => ({
      ok: false,
      error: "We couldn't create your account. Try again.",
    }),
  },
};
