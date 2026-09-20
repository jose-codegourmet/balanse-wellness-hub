import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachListPage } from "./CoachListPage";

const meta = {
  title: "Admin/Screens/Coaches",
  component: CoachListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof CoachListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};
