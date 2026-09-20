import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SettingsPage } from "./SettingsPage";

const meta = {
  title: "Admin/Screens/Settings",
  component: SettingsPage,
  tags: ["autodocs"],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
