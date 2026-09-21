import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardBento } from "@/components/balanse/dashboard/dashboard-bento/DashboardBento";
import { AdminStatStrip } from "./AdminStatStrip";
import { adminStatStripDefaultValues } from "./AdminStatStrip.defaults";

const meta: Meta<typeof AdminStatStrip> = {
  title: "Admin/Components/AdminStatStrip",
  component: AdminStatStrip,
  tags: ["autodocs"],
  args: { ...adminStatStripDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DashboardBento>
      <AdminStatStrip {...args} />
    </DashboardBento>
  ),
};
