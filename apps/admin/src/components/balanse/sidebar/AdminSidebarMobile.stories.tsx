import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AdminSidebarMobile } from "./AdminSidebarMobile";
import { adminSidebarMobileDefaultValues } from "./AdminSidebarMobile.defaults";
import { sidebarSnapshotEmpty } from "./AdminSidebarNav.defaults";

const meta: Meta<typeof AdminSidebarMobile> = {
  title: "Admin/Components/AdminSidebarMobile",
  component: AdminSidebarMobile,
  tags: ["autodocs"],
  args: { ...adminSidebarMobileDefaultValues },
  decorators: [
    (Story) => (
      <div className="w-[360px] [&_header]:flex [&_header]:md:flex">
        <Story />
      </div>
    ),
  ],
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
