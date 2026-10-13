import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffPasswordForm } from "./StaffPasswordForm";

const meta = {
  title: "Admin/Staff/Set password form",
  component: StaffPasswordForm,
  args: { onSubmit: async () => undefined },
} satisfies Meta<typeof StaffPasswordForm>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const ExpiredInvite: StoryObj<typeof meta> = {
  args: {
    onSubmit: async () => {
      throw new Error(
        "This invitation has expired or has already been used. Ask your administrator for a fresh link.",
      );
    },
  },
};
