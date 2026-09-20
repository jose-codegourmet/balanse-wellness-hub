import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

import { AdminSidebar } from "./AdminSidebar";
import { adminSidebarDefaultValues } from "./AdminSidebar.defaults";
import { sidebarSnapshotEmpty, sidebarSnapshotOverflow } from "./AdminSidebarNav.defaults";

function SeedAdmin({ children }: { children: React.ReactNode }) {
  const { principal, setPrincipal } = useMockPrincipal();
  useEffect(() => {
    if (principal.role !== "admin") setPrincipal({ role: "admin" });
  }, [principal.role, setPrincipal]);
  return children;
}

const meta: Meta<typeof AdminSidebar> = {
  title: "Admin/Components/AdminSidebar",
  component: AdminSidebar,
  tags: ["autodocs"],
  args: { ...adminSidebarDefaultValues },
  decorators: [
    (Story) => (
      <SeedAdmin>
        <div className="flex min-h-[32rem] bg-background">
          <Story />
        </div>
      </SeedAdmin>
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
