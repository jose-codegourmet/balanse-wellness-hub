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
