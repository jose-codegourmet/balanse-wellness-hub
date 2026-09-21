import { ADMIN_NAV_ITEMS } from "@balanse/domain";
import { TooltipProvider } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminSidebarNav } from "./AdminSidebarNav";
import {
  adminSidebarNavDefaultValues,
  sidebarSnapshotEmpty,
  sidebarSnapshotOverflow,
} from "./AdminSidebarNav.stories-data";

const meta: Meta<typeof AdminSidebarNav> = {
  title: "Admin/Components/AdminSidebarNav",
  component: AdminSidebarNav,
  tags: ["autodocs"],
  args: { ...adminSidebarNavDefaultValues },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-64 border border-sidebar-border bg-sidebar">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-16 border border-sidebar-border bg-sidebar">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export const WithoutCounts: Story = {
  args: { snapshot: sidebarSnapshotEmpty },
};

export const OverflowCount: Story = {
  args: { snapshot: sidebarSnapshotOverflow, pathname: "/payments" },
};

export const LongLabelItem: Story = {
  args: {
    items: ADMIN_NAV_ITEMS.map((item) =>
      item.id === "cancellations" ? { ...item, label: "Same-day cancellation requests" } : item,
    ),
  },
};
