import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RoleFormPage } from "./RoleFormPage";

const meta = {
  title: "Admin/Screens/Role Detail",
  component: RoleFormPage,
  tags: ["autodocs"],
  args: { roleId: "role-community-host" },
} satisfies Meta<typeof RoleFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomRole: Story = {};

export const BuiltIn: Story = {
  args: { roleId: "role-super-admin" },
};

export const Create: Story = {
  args: { roleId: "new" },
};

export const Clone: Story = {
  args: { roleId: "new", cloneSourceId: "role-front-desk" },
};

export const Forbidden: Story = {
  args: { roleId: "role-super-admin" },
  globals: { principal: "customer" },
};
