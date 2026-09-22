import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RoleListPage } from "./RoleListPage";

const meta = {
  title: "Admin/Screens/Roles",
  component: RoleListPage,
  tags: ["autodocs"],
  args: { empty: false },
} satisfies Meta<typeof RoleListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

export const Empty: Story = {
  args: { empty: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadFailed: Story = {
  args: { error: true },
};

export const Forbidden: Story = {
  globals: { principal: "customer" },
};
