import { customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PasswordSettingsForm } from "./PasswordSettingsForm";

const meta: Meta<typeof PasswordSettingsForm> = {
  title: "Portal/Password settings form",
  component: PasswordSettingsForm,
  tags: ["autodocs"],
  args: { profile: customers[0] },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
