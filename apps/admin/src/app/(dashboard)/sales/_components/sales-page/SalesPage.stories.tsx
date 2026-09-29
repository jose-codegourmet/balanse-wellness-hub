import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { SalesPage } from "./SalesPage";

const meta = {
  title: "Admin/Screens/Sales",
  component: SalesPage,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/sales" } } },
  decorators: [
    (Story) => (
      <AdminGuard>
        <Suspense fallback={<p>Loading sales…</p>}>
          <Story />
        </Suspense>
      </AdminGuard>
    ),
  ],
} satisfies Meta<typeof SalesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const Empty: Story = { args: { initialRange: { from: "2030-01-01", to: "2030-01-31" } } };
export const Mobile: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
export const FrontDeskDenied: Story = { parameters: { staffId: "staff-partner" } };
export const CoachDenied: Story = { parameters: { staffId: "staff-ephraim" } };
export const CustomRoleDenied: Story = { parameters: { staffId: "staff-custom" } };
export const DisabledStaffDenied: Story = { parameters: { staffId: "staff-disabled" } };
export const CustomerDenied: Story = { globals: { principal: "customer" } };
