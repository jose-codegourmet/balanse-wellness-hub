import { FRONT_DESK_PERMISSION_KEYS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RoleForm } from "./RoleForm";
import { roleFormDefaultValues, roleFormValuesFrom } from "./RoleForm.defaults";
import { roleFormSchema } from "./RoleForm.schema";

const meta = {
  title: "Admin/Screens/Role Form",
  component: RoleForm,
  tags: ["autodocs"],
  args: {
    defaultValues: roleFormDefaultValues,
    onSubmit: async () => undefined,
  },
  parameters: { roleFormSchema, roleFormDefaultValues },
} satisfies Meta<typeof RoleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const CloneFromFrontDesk: Story = {
  args: {
    cloneSourceName: "Front Desk",
    defaultValues: roleFormValuesFrom({
      name: "Copy of Front Desk",
      description: "Cloned custom role.",
      permissionKeys: FRONT_DESK_PERMISSION_KEYS,
      cloneSourceId: "role-front-desk",
    }),
  },
};

export const BuiltInProtected: Story = {
  args: {
    builtIn: true,
    defaultValues: roleFormValuesFrom({
      name: "Super Admin",
      description: "Protected built-in.",
      permissionKeys: FRONT_DESK_PERMISSION_KEYS,
    }),
  },
};
