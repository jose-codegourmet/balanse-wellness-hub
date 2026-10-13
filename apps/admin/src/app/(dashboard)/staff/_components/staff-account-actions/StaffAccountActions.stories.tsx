import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffAccountActions } from "./StaffAccountActions";

const meta: Meta<typeof StaffAccountActions> = {
  title: "Admin/Components/Staff Account Actions",
  component: StaffAccountActions,
  tags: ["autodocs"],
  args: { staffId: "staff-rex", staffName: "Rex" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
