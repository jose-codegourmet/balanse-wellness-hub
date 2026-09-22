import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BundleFormPage } from "./BundleFormPage";

const meta = {
  title: "Admin/Screens/BundleForm",
  component: BundleFormPage,
  tags: ["autodocs"],
} satisfies Meta<typeof BundleFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = { args: { bundleId: "new" } };
export const EditNewbie: Story = { args: { bundleId: "bundle-newbie" } };
