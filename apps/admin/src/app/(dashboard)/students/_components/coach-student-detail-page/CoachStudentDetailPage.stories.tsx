import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { CoachStudentDetailPage } from "./CoachStudentDetailPage";

const meta = {
  title: "Admin/Screens/Coach student detail",
  component: CoachStudentDetailPage,
  tags: ["autodocs"],
  parameters: {
    nextjs: { navigation: { pathname: "/students/cust-q-roster-00" } },
    staffId: "staff-ephraim",
  },
  decorators: [
    (Story) => (
      <AdminGuard>
        <Story />
      </AdminGuard>
    ),
  ],
} satisfies Meta<typeof CoachStudentDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Student: Story = { args: { customerId: "cust-q-roster-00" } };

export const Missing: Story = { args: { customerId: "cust-empty" } };
