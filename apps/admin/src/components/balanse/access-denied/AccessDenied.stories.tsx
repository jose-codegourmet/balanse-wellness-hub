import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccessDenied } from "./AccessDenied";

const meta: Meta<typeof AccessDenied> = {
  title: "Admin/Components/AccessDenied",
  component: AccessDenied,
};

export default meta;

type Story = StoryObj<typeof AccessDenied>;

export const Forbidden: Story = {
  args: { kind: "forbidden" },
};

export const Revoked: Story = {
  args: { kind: "revoked" },
};

export const Denied: Story = {
  args: { kind: "denied", homeHref: "/schedule" },
};
