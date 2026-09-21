import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { staffFormDefaultValues } from "@/modules/admin/forms/staff/staff-form.defaults";
import { staffFormSchema } from "@/modules/admin/forms/staff/staff-form.schema";
import { StaffDetailPage } from "./StaffDetailPage";
import { staffDetailPageDefaultValues } from "./StaffDetailPage.defaults";

const meta = {
  title: "Admin/Screens/Staff Detail",
  component: StaffDetailPage,
  tags: ["autodocs"],
  args: { ...staffDetailPageDefaultValues },
  parameters: {
    staffFormSchema,
    staffFormDefaultValues,
  },
} satisfies Meta<typeof StaffDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StaffWhoIsACoach: Story = {
  args: { staffId: "staff-rex" },
};

export const StaffWhoIsNotACoach: Story = {
  args: { staffId: "staff-partner" },
};

export const Create: Story = {
  args: { staffId: "new" },
};

export const SubmitFailure: Story = {
  args: { staffId: "staff-rex" },
  parameters: { mockRuntime: { failNext: true } },
};

export const NonAdminNoCoachRates: Story = {
  args: { staffId: "staff-rex" },
  globals: { principal: "customer" },
};
