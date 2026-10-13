import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffInviteDialog } from "./StaffInviteDialog";

const meta = {
  title: "Admin/Staff/Invite dialog",
  component: StaffInviteDialog,
  args: {
    staffName: "Alex Cruz",
    inviteUrl: "https://admin.example.com/auth/set-password#token_hash=storybook-example",
    onClose: () => undefined,
  },
} satisfies Meta<typeof StaffInviteDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PendingInvitation: Story = {};
export const ExistingAccount: Story = { args: { inviteUrl: null } };
export const PasswordReset: Story = {
  args: {
    kind: "reset",
    inviteUrl:
      "https://admin.example.com/auth/set-password#token_hash=storybook-example&type=recovery",
  },
};
