import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffDetailPage, StaffListPage } from "./StaffPages";

const meta = {
  title: "Admin/Screens/Staff",
  component: StaffListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof StaffListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { empty: true },
};

export const List: Story = {};

export const Detail: StoryObj<typeof StaffDetailPage> = {
  render: () => <StaffDetailPage staffId="staff-rex" />,
};
