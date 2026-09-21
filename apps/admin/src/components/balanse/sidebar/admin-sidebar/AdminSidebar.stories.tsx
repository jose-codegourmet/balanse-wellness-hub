import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  sidebarSnapshotEmpty,
  sidebarSnapshotOverflow,
} from "../admin-sidebar-nav/AdminSidebarNav.stories-data";
import { AdminSidebar } from "./AdminSidebar";
import { adminSidebarDefaultValues } from "./AdminSidebar.stories-data";

const meta: Meta<typeof AdminSidebar> = {
  title: "Admin/Components/AdminSidebar",
  component: AdminSidebar,
  tags: ["autodocs"],
  args: { ...adminSidebarDefaultValues },
  decorators: [
    (Story) => (
      <div className="flex min-h-[32rem] bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true },
};

export const WithoutCounts: Story = {
  args: { snapshot: sidebarSnapshotEmpty },
};

export const OverflowCount: Story = {
  args: { snapshot: sidebarSnapshotOverflow, pathname: "/payments" },
};

export const MobileDrawerOpen: Story = {
  args: { mobileOpen: true },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};
