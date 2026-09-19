import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MockImageUpload } from "./MockImageUpload";

const meta = {
  title: "Foundation/MockImageUpload",
  component: MockImageUpload,
  args: {
    label: "Payment proof",
    fallbackLabel: "No image selected",
  },
} satisfies Meta<typeof MockImageUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const UploadFailed: Story = { args: { forceFailure: true } };
