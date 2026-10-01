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

/** Community member in Ephraim's Capoeira event: avatar, nickname "Migs", and About answers. */
export const StudentWithAbout: Story = {
  args: { customerId: "cust-m-02" },
  parameters: { nextjs: { navigation: { pathname: "/students/cust-m-02" } } },
};

/** Not-started onboarding (`cust-m-09`): About shows "Hasn't completed onboarding yet". */
export const StudentWithoutAnswers: Story = {
  args: { customerId: "cust-m-09" },
  parameters: { nextjs: { navigation: { pathname: "/students/cust-m-09" } } },
};

export const Missing: Story = { args: { customerId: "cust-empty" } };
