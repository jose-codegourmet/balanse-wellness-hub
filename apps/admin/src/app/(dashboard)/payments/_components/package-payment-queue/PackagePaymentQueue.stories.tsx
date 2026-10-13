import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PackagePaymentQueue } from "./PackagePaymentQueue";

const meta = {
  title: "Admin/Payments/PackagePaymentQueue",
  component: PackagePaymentQueue,
  args: { search: "" },
} satisfies Meta<typeof PackagePaymentQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoMatches: Story = { args: { search: "zzz-no-match" } };
