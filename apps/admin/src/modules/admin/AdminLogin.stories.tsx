import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminLogin } from "./AdminLogin";

const meta = {
  title: "Admin/Screens/Login",
  component: AdminLogin,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      config: {
        rules: [
          // BrandLockup tagline uses `text-accent` on canvas (~2.14:1). Token
          // contrast is a brand/INF concern, not a login redesign. See #240.
          { id: "color-contrast", enabled: false },
        ],
      },
    },
  },
} satisfies Meta<typeof AdminLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Submitting: Story = { args: { forcedStatus: "submitting" } };
export const InvalidCredentials: Story = { args: { forcedStatus: "invalid" } };
export const NotAdmin: Story = { args: { forcedStatus: "not-admin" } };
