import { TooltipProvider } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminSidebarToggle } from "./AdminSidebarToggle";
import { adminSidebarToggleDefaultValues } from "./AdminSidebarToggle.defaults";

const meta: Meta<typeof AdminSidebarToggle> = {
  title: "Admin/Components/AdminSidebarToggle",
  component: AdminSidebarToggle,
  tags: ["autodocs"],
  args: { ...adminSidebarToggleDefaultValues, onToggle: () => undefined },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <nav aria-label="Admin" className="sr-only" id="admin-sidebar-nav">
          Navigation
        </nav>
        <Story />
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
