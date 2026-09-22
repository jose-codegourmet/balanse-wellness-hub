import { BUILT_IN_ROLE_DEFINITIONS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffRoleSummary } from "./StaffRoleSummary";

const meta = {
  title: "Admin/Components/StaffRoleSummary",
  component: StaffRoleSummary,
  tags: ["autodocs"],
} satisfies Meta<typeof StaffRoleSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { role: null },
};

export const FrontDesk: Story = {
  args: {
    role: {
      id: "role-front-desk",
      ...BUILT_IN_ROLE_DEFINITIONS[1],
      assignedStaffCount: 1,
      permissionCount: BUILT_IN_ROLE_DEFINITIONS[1].permissionKeys.length,
    },
  },
};
