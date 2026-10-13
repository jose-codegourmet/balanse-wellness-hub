import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PackagesPage } from "./PackagesPage";

const meta = {
  title: "Public/Packages",
  component: PackagesPage,
  tags: ["autodocs"],
} satisfies Meta<typeof PackagesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalogue: Story = {
  args: {
    bundles: [
      {
        id: "bundle-newbie",
        slug: "newbie-package",
        name: "Newbie Package",
        summary: "Twelve sessions to start your practice.",
        description: "",
        sessionCreditCount: 12,
        pricePhp: 0,
        applicabilityMode: "ALL_ACTIVE_CLASSES",
        classIds: [],
        validityDays: null,
        perCustomerLimit: 1,
        status: "PUBLISHED",
      },
    ],
  },
};

export const Empty: Story = {
  args: { bundles: [] },
};
