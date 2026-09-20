import { buildAdminDashboard } from "@balanse/domain";
import { adminSessions, bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardPage } from "./DashboardPage";

const seeded = buildAdminDashboard(adminSessions, bookings, "2026-09-16");

const meta = {
  title: "Admin/Screens/Dashboard",
  component: DashboardPage,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Seeded: Story = {
  args: { initial: seeded },
};

export const SlowLoad: Story = {
  parameters: {
    mockRuntime: { latencyMs: 800 },
  },
};
