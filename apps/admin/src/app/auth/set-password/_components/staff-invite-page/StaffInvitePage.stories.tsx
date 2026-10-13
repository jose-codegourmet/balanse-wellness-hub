import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffInvitePage } from "./StaffInvitePage";

const meta: Meta<typeof StaffInvitePage> = {
  title: "Admin/Staff/Invite page",
  component: StaffInvitePage,
  args: { onSubmit: async () => ({ ok: true }) },
};
export default meta;
export const MissingInvitation: StoryObj<typeof meta> = {};
export const PasswordSetup: StoryObj<typeof meta> = { args: { canResume: true } };
export const PasswordReset: StoryObj<typeof meta> = {
  args: { canResume: true, defaultTokenType: "recovery" },
};
export const ExpiredResetLink: StoryObj<typeof meta> = {
  args: {
    canResume: true,
    defaultTokenType: "recovery",
    onSubmit: async () => ({
      ok: false,
      message:
        "This link has expired or has already been used. Ask your administrator for a fresh link.",
    }),
  },
};
