import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffListPage } from "./StaffListPage";
import { staffListPageDefaultValues } from "./StaffListPage.defaults";

const meta = {
  title: "Admin/Screens/Staff",
  component: StaffListPage,
  tags: ["autodocs"],
  args: { ...staffListPageDefaultValues },
} satisfies Meta<typeof StaffListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const List: Story = {};

/** Fixture `staff-rex` is linked to `coach-rex` (same human, two rows). */
export const StaffWhoIsACoach: Story = {};

/** Studio Partner is staff-only — capability stays Admin. */
export const StaffWhoIsNotACoach: Story = {};
