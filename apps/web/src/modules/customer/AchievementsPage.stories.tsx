import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AchievementsPage } from "./AchievementsPage";

const meta = {
  title: "Customer/Achievements",
  component: AchievementsPage,
} satisfies Meta<typeof AchievementsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComingSoon: Story = {};
