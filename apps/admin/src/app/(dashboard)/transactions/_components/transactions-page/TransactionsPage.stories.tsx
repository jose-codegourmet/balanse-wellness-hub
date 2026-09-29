import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { TransactionsPage } from "./TransactionsPage";

const meta = {
  title: "Admin/Screens/Transactions",
  component: TransactionsPage,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/transactions" } } },
  decorators: [
    (Story) => (
      <AdminGuard>
        <Suspense fallback={<p>Loading transactions…</p>}>
          <Story />
        </Suspense>
      </AdminGuard>
    ),
  ],
} satisfies Meta<typeof TransactionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const Empty: Story = { args: { empty: true } };
export const Mobile: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };
export const FrontDeskDenied: Story = { parameters: { staffId: "staff-partner" } };
export const CoachDenied: Story = { parameters: { staffId: "staff-ephraim" } };
export const CustomRoleDenied: Story = { parameters: { staffId: "staff-custom" } };
export const DisabledStaffDenied: Story = { parameters: { staffId: "staff-disabled" } };
export const CustomerDenied: Story = { globals: { principal: "customer" } };
