import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminSidebarFooter } from "./AdminSidebarFooter";
import { adminSidebarFooterDefaultValues } from "./AdminSidebarFooter.defaults";

const meta: Meta<typeof AdminSidebarFooter> = {
  title: "Admin/Components/AdminSidebarFooter",
  component: AdminSidebarFooter,
  tags: ["autodocs"],
  args: { ...adminSidebarFooterDefaultValues },
  decorators: [
    (Story) => (
      <div className="w-64 border border-border bg-background">
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
  decorators: [
    (Story) => (
      <div className="w-16 border border-border bg-background">
        <Story />
      </div>
    ),
  ],
};
