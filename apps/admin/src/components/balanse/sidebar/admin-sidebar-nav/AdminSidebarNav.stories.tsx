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
    (Story, context) => (
      <TooltipProvider>
        <div
          className={
            context.args.collapsed
              ? "w-[4.75rem] border border-sidebar-border bg-sidebar"
              : "w-72 border border-sidebar-border bg-sidebar"
          }
        >
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

export const DirectoryActive: Story = { args: { pathname: "/customers" } };
export const Dark: Story = { globals: { theme: "dark" } };

export const StaggeredEntrance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Menu rows enter in order on mount and each time the collapsed control changes. Expansion uses a 100 ms lead-in and 45 ms between rows; collapse uses 25 ms between icons; reduced-motion preferences show all rows immediately. Labels are semibold, with a bold active route.",
      },
    },
  },
};
