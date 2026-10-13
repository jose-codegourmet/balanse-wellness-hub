import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { StaffProfilePage } from "./StaffProfilePage";

const meta = {
  title: "Admin/Screens/My profile",
  component: StaffProfilePage,
  tags: ["autodocs"],
  parameters: {
    nextjs: { navigation: { pathname: "/my-profile" } },
    docs: {
      description: {
        component:
          "Self-service photo upload is available to every active staff member, including Coach/custom roles without staff.manage. JPG/PNG/WEBP up to 5 MB; saves immediately and refreshes navigation. Stories do not contact live storage.",
      },
    },
  },
  decorators: [
    (Story) => (
      <AdminGuard>
        <Story />
      </AdminGuard>
    ),
  ],
} satisfies Meta<typeof StaffProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SuperAdmin: Story = {};

export const Coach: Story = {
  parameters: { staffId: "staff-ephraim" },
};

export const CustomRole: Story = {
  parameters: { staffId: "staff-custom" },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
};
