import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachPhotoDemo } from "./CoachPhotoDemo";

const meta = {
  title: "Admin/Components/CoachPhotoDemo",
  component: CoachPhotoDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof CoachPhotoDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
