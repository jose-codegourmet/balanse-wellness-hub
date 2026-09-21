import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sidebarSnapshotEmpty } from "../admin-sidebar-nav/AdminSidebarNav.defaults";
import { AdminSidebarMobile } from "./AdminSidebarMobile";
import { adminSidebarMobileDefaultValues } from "./AdminSidebarMobile.defaults";

const meta: Meta<typeof AdminSidebarMobile> = {
  title: "Admin/Components/AdminSidebarMobile",
  component: AdminSidebarMobile,
  tags: ["autodocs"],
  args: { ...adminSidebarMobileDefaultValues },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DrawerOpen: Story = {
  args: { open: true },
};

export const WithoutCounts: Story = {
  args: { open: true, snapshot: sidebarSnapshotEmpty },
};
