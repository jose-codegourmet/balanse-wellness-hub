import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminNotificationHeader } from "./AdminNotificationHeader";
import { adminNotificationHeaderDefaultValues } from "./AdminNotificationHeader.stories-data";

const meta = {
  title: "Admin/Layout/Notification header",
  component: AdminNotificationHeader,
  tags: ["autodocs"],
  args: { ...adminNotificationHeaderDefaultValues },
} satisfies Meta<typeof AdminNotificationHeader>;
export default meta;
export const Default: StoryObj<typeof meta> = {};

export const Payments: StoryObj<typeof meta> = { args: { pathname: "/payments" } };
export const Compact: StoryObj<typeof meta> = { args: { compact: true } };
export const Dark: StoryObj<typeof meta> = { globals: { theme: "dark" } };
export const Loading: StoryObj<typeof meta> = { parameters: { mockRuntime: { latencyMs: 10000 } } };
export const Empty: StoryObj<typeof meta> = {
  parameters: { mockRuntime: { emptyAdminQueues: true } },
};
