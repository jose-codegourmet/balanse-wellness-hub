import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminForm } from "@/modules/admin/forms/admin-form/AdminForm";
import {
  coachFormDefaultValues,
  coachStaffSourceDefaultValues,
} from "@/modules/admin/forms/coach/coach-form.defaults";
import { coachNewFormSchema } from "@/modules/admin/forms/coach/coach-form.schema";
import { CoachStaffSource } from "./CoachStaffSource";

const staff = [
  {
    id: "staff-ana",
    name: "Ana Santos",
    email: "ana@example.com",
    status: "active" as const,
    coachId: null,
  },
  {
    id: "staff-ben",
    name: "Ben Cruz",
    email: "ben@example.com",
    status: "active" as const,
    coachId: "coach-x",
  },
];
const roles = [
  { id: "role-coach", key: "coach", name: "Coach", builtIn: true, status: "active" as const },
  {
    id: "role-fd",
    key: "front_desk",
    name: "Front Desk",
    builtIn: true,
    status: "active" as const,
  },
];

const meta = {
  title: "Admin/Coaches/CoachStaffSource",
  component: CoachStaffSource,
  args: { staff, roles, canInvite: true, canPickStaff: true },
  render: (args) => (
    <AdminForm
      id="coach-staff-source-story"
      schema={coachNewFormSchema}
      defaultValues={{ ...coachFormDefaultValues, ...coachStaffSourceDefaultValues }}
      onSubmit={() => undefined}
    >
      <CoachStaffSource {...args} />
    </AdminForm>
  ),
} satisfies Meta<typeof CoachStaffSource>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PickExistingStaff: Story = {};
export const InviteOnly: Story = { args: { canPickStaff: false } };
export const NoStaffAccess: Story = { args: { canInvite: false, canPickStaff: false } };
