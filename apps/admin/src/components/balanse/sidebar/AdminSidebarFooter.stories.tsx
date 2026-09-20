import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

import { AdminSidebarFooter } from "./AdminSidebarFooter";
import { adminSidebarFooterDefaultValues } from "./AdminSidebarFooter.defaults";

function SeedAdmin({ children }: { children: React.ReactNode }) {
  const { principal, setPrincipal } = useMockPrincipal();
  useEffect(() => {
    if (principal.role !== "admin") setPrincipal({ role: "admin" });
  }, [principal.role, setPrincipal]);
  return children;
}

const meta: Meta<typeof AdminSidebarFooter> = {
  title: "Admin/Components/AdminSidebarFooter",
  component: AdminSidebarFooter,
  tags: ["autodocs"],
  args: { ...adminSidebarFooterDefaultValues },
  decorators: [
    (Story) => (
      <SeedAdmin>
        <div className="w-64 border border-border bg-background">
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
  decorators: [
    (Story) => (
      <div className="w-16 border border-border bg-background">
        <Story />
      </div>
    ),
  ],
};
