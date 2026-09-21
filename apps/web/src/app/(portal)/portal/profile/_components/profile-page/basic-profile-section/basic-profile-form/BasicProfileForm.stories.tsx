import { customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BasicProfileForm } from "./BasicProfileForm";

const meta: Meta<typeof BasicProfileForm> = {
  title: "Portal/Basic profile form",
  component: BasicProfileForm,
  tags: ["autodocs"],
  args: { profile: customers[0], onSaved: () => undefined },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
