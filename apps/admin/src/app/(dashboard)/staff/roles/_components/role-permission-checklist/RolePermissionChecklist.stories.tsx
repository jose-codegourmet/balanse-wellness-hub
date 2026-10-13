import { COACH_PERMISSION_KEYS, PERMISSION_REGISTRY } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { RolePermissionChecklist } from "./RolePermissionChecklist";

const meta = {
  title: "Admin/Components/RolePermissionChecklist",
  component: RolePermissionChecklist,
  tags: ["autodocs"],
} satisfies Meta<typeof RolePermissionChecklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoachDefaults: Story = {
  args: {
    permissions: PERMISSION_REGISTRY,
    value: COACH_PERMISSION_KEYS,
    onChange: () => undefined,
    onBlur: () => undefined,
    name: "permissionKeys",
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <RolePermissionChecklist {...args} value={value} onChange={setValue} />;
  },
};
