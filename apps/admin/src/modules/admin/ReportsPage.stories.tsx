import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { ReportDrilldownPage, ReportsPage } from "./ReportsPage";

const meta = {
  title: "Admin/Screens/Reports",
  component: ReportsPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ReportsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const Overview: Story = {};

export const Drilldown: StoryObj<typeof ReportDrilldownPage> = {
  render: () => <ReportDrilldownPage sessionId="session-wed-open" />,
};

export const AsCustomer: Story = {
  globals: { principal: "customer" },
  render: () => (
    <AdminGuard>
      <ReportsPage />
    </AdminGuard>
  ),
};
