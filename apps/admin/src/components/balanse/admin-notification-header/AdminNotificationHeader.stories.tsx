import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminNotificationHeader } from "./AdminNotificationHeader";
import { adminNotificationHeaderDefaultValues } from "./AdminNotificationHeader.defaults";

const meta = {
  title: "Admin/Layout/Notification header",
  component: AdminNotificationHeader,
  args: adminNotificationHeaderDefaultValues,
} satisfies Meta<typeof AdminNotificationHeader>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
