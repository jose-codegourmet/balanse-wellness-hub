import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachLinkStaff } from "./CoachLinkStaff";

const meta = {
  title: "Admin/Coaches/CoachLinkStaff",
  component: CoachLinkStaff,
  args: {
    coachId: "coach-alec",
    coachName: "Alec James Co",
    staff: [
      {
        id: "staff-ana",
        name: "Ana Santos",
        email: "ana@example.com",
        status: "active",
        coachId: null,
      },
      {
        id: "staff-ben",
        name: "Ben Cruz",
        email: "ben@example.com",
        status: "active",
        coachId: "coach-x",
      },
    ],
  },
} satisfies Meta<typeof CoachLinkStaff>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoAvailableStaff: Story = { args: { staff: [] } };
