import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachStaffLink } from "./CoachStaffLink";
import {
  coachStaffLinkDefaultValues,
  coachStaffLinkUnlinkedDefaultValues,
} from "./CoachStaffLink.stories-data";

const meta = {
  title: "Admin/Components/CoachStaffLink",
  component: CoachStaffLink,
  tags: ["autodocs"],
  args: coachStaffLinkDefaultValues,
} satisfies Meta<typeof CoachStaffLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LinkedStaff: Story = {};

export const CoachWithNoStaffAccount: Story = {
  args: coachStaffLinkUnlinkedDefaultValues,
};
