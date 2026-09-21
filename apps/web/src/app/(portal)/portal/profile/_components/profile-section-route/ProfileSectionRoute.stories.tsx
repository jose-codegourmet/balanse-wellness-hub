import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfileSectionRoute } from "./ProfileSectionRoute";

const meta: Meta<typeof ProfileSectionRoute> = {
  title: "Portal/Profile section route",
  component: ProfileSectionRoute,
  tags: ["autodocs"],
  args: { section: "basic" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
export const Account: Story = { args: { section: "account" } };
