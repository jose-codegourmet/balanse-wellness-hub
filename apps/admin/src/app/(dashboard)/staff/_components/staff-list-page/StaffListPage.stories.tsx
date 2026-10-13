import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import { StaffListPage } from "./StaffListPage";

const meta = {
  title: "Admin/Screens/Staff",
  component: StaffListPage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Suspense fallback={<p>Loading staff…</p>}>
        <Story />
      </Suspense>
    ),
  ],
  args: { empty: false },
} satisfies Meta<typeof StaffListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const List: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Active staff rows expose separate Invite and Reset password cells with direct Copy link buttons and no overflow menu. Both controls are visible in mobile cards. No emails are sent.",
      },
    },
  },
};

/** Fixture `staff-rex` is linked to `coach-rex` (same human, two rows). */
export const StaffWhoIsACoach: Story = {};

/** Studio Partner is staff-only — Front Desk, not a coach. */
export const StaffWhoIsNotACoach: Story = {};
