import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PackageDetailPage } from "./PackageDetailPage";

const meta = {
  title: "Public/PackageDetail",
  component: PackageDetailPage,
  tags: ["autodocs"],
} satisfies Meta<typeof PackageDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  args: {
    package: {
      id: "bundle-newbie",
      slug: "newbie-package",
      name: "Newbie Package",
      summary: "Twelve sessions to start your Balansé practice.",
      description: "A studio welcome package with twelve session credits.",
      sessionCreditCount: 12,
      pricePhp: 0,
      applicabilityMode: "ALL_ACTIVE_CLASSES",
      classIds: [],
      validityDays: null,
      perCustomerLimit: 1,
      status: "PUBLISHED",
    },
    signedIn: false,
  },
};
