import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { CoachFormPage, CoachListPage } from "./CoachPages";

const meta = {
  title: "Admin/Screens/Coaches",
  component: CoachListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CoachListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

export const Form: StoryObj<typeof CoachFormPage> = {
  render: () => <CoachFormPage coachId="coach-rex" />,
};

/** AdminGuard is the app-level gate; rate fields must not render for a non-admin. */
export const FormAsCustomer: StoryObj<typeof CoachFormPage> = {
  globals: { principal: "customer" },
  render: () => (
    <AdminGuard>
      <CoachFormPage coachId="coach-rex" />
    </AdminGuard>
  ),
};
