import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageUpload } from "./ImageUpload";

const meta = {
  title: "Admin/Components/ImageUpload",
  component: ImageUpload,
  tags: ["autodocs"],
  args: {
    label: "Coach profile photo",
    fallbackLabel: "No image selected",
  },
} satisfies Meta<typeof ImageUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UploadFailed: Story = {
  args: { forceFailure: true },
};
