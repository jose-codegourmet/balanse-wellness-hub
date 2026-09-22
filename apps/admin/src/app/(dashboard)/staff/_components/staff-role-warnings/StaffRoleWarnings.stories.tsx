import { BUILT_IN_ROLE_DEFINITIONS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffRoleWarnings } from "./StaffRoleWarnings";

const coachRole = {
  id: "role-coach",
  ...BUILT_IN_ROLE_DEFINITIONS[2],
  assignedStaffCount: 1,
  permissionCount: BUILT_IN_ROLE_DEFINITIONS[2].permissionKeys.length,
};

const meta = {
  title: "Admin/Components/StaffRoleWarnings",
  component: StaffRoleWarnings,
  tags: ["autodocs"],
} satisfies Meta<typeof StaffRoleWarnings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoachWithoutLink: Story = {
  args: {
    role: coachRole,
    isCoach: false,
    coachId: null,
    targetIsActiveSuperAdmin: false,
    activeSuperAdminCount: 2,
    actor: null,
  },
};
