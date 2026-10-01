import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { CoachStudentsPage } from "./CoachStudentsPage";

const meta = {
  title: "Admin/Screens/My Students",
  component: CoachStudentsPage,
  tags: ["autodocs"],
  parameters: {
    nextjs: { navigation: { pathname: "/students" } },
    staffId: "staff-ephraim",
  },
  decorators: [
    (Story) => (
      <AdminGuard>
        <Story />
      </AdminGuard>
    ),
  ],
} satisfies Meta<typeof CoachStudentsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Includes community members with avatars and nicknames (e.g. "Migs"). */
export const Upcoming: Story = {};

export const Empty: Story = { args: { empty: true } };

export const FrontDeskDenied: Story = { parameters: { staffId: "staff-partner" } };
