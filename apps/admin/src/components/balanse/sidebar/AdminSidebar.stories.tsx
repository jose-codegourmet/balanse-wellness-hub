import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminSidebar } from "./AdminSidebar";
import { adminSidebarDefaultValues } from "./AdminSidebar.defaults";
import { sidebarSnapshotEmpty, sidebarSnapshotOverflow } from "./AdminSidebarNav.defaults";

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

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div className="dark flex min-h-[32rem] bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
};

export const MobileDrawerOpen: Story = {
  args: { mobileOpen: true },
  decorators: [
    (Story) => (
      <div className="w-[360px] [&_header]:flex [&_header]:md:flex">
        <style>{".sb-main-padded aside{display:none}"}</style>
        <Story />
      </div>
    ),
  ],
};
