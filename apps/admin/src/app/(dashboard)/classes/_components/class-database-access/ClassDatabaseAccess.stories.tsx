import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassDatabaseAccess } from "./ClassDatabaseAccess";
import { classDatabaseAccessDefaultValues } from "./ClassDatabaseAccess.defaults";

const meta = {
  title: "Admin/Classes/DatabaseAccess",
  component: ClassDatabaseAccess,
  tags: ["autodocs"],
  args: {
    ...classDatabaseAccessDefaultValues,
    canSave: false,
    onConnected: () => {},
    connect: async () => ({ error: "No administrator is provisioned in this preview." }),
  },
  parameters: { defaultValues: classDatabaseAccessDefaultValues },
} satisfies Meta<typeof ClassDatabaseAccess>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SignIn: Story = {};
export const Connected: Story = { args: { canSave: true } };
