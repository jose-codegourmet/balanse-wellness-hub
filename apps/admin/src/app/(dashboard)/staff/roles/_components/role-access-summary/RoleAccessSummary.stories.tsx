import { FRONT_DESK_PERMISSION_KEYS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RoleAccessSummary } from "./RoleAccessSummary";

const meta = {
  title: "Admin/Components/RoleAccessSummary",
  component: RoleAccessSummary,
  tags: ["autodocs"],
} satisfies Meta<typeof RoleAccessSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { permissionKeys: [] },
};

export const FrontDesk: Story = {
  args: { permissionKeys: FRONT_DESK_PERMISSION_KEYS },
};
