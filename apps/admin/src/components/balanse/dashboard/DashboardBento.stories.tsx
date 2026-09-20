import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardBento } from "./DashboardBento";
import { dashboardBentoDefaultValues } from "./DashboardBento.defaults";
import { DashboardTile } from "./DashboardTile";
import { dashboardTileDefaultValues } from "./DashboardTile.defaults";

const meta: Meta<typeof DashboardBento> = {
  title: "Admin/Components/DashboardBento",
  component: DashboardBento,
  tags: ["autodocs"],
  args: { ...dashboardBentoDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DashboardBento {...args}>
      <DashboardTile span="attention">Needs Attention</DashboardTile>
      <DashboardTile span="schedule">Today&apos;s Schedule</DashboardTile>
      <DashboardTile {...dashboardTileDefaultValues}>Today&apos;s Classes</DashboardTile>
      <DashboardTile span="stat">Pending Payments</DashboardTile>
      <DashboardTile span="chart">Gross sales</DashboardTile>
      <DashboardTile span="metric">Today&apos;s Sales</DashboardTile>
    </DashboardBento>
  ),
};
