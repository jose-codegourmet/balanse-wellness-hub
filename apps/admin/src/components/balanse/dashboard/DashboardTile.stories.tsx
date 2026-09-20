import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardTile } from "./DashboardTile";
import { dashboardTileDefaultValues } from "./DashboardTile.defaults";

const meta: Meta<typeof DashboardTile> = {
  title: "Admin/Components/DashboardTile",
  component: DashboardTile,
  tags: ["autodocs"],
  args: {
    ...dashboardTileDefaultValues,
    children: "Today's Classes",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Attention: Story = {
  args: { span: "attention", children: "Needs Attention" },
};

export const Linked: Story = {
  args: { href: "/payments", children: "Pending Payments" },
};
