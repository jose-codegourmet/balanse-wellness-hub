import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BrandLockup } from "./BrandLockup";

const meta = {
  title: "Foundation/BrandLockup",
  component: BrandLockup,
} satisfies Meta<typeof BrandLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WordmarkOnly: Story = { args: { showTagline: false } };
