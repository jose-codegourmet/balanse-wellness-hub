import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { CoachFormPage } from "./CoachPages";

const meta = {
  title: "Admin/Screens/Coach Form",
  component: CoachFormPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CoachFormPage>;

export default meta;

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
