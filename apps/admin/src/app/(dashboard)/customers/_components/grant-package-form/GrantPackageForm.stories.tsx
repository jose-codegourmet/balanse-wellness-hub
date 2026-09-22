import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GrantPackageForm } from "./GrantPackageForm";

const meta = {
  title: "Admin/Screens/GrantPackageForm",
  component: GrantPackageForm,
  tags: ["autodocs"],
} satisfies Meta<typeof GrantPackageForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    customerId: "cust-empty",
    bundles: [
      {
        id: "bundle-newbie",
        name: "Newbie Package",
        slug: "newbie-package",
        summary: "Twelve sessions",
        description: "",
        sessionCredits: 12,
        pricePhp: 0,
        applicability: { allActiveClasses: true, classIds: [] },
        validityDays: null,
        perCustomerLimit: 1,
        status: "PUBLISHED",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
    ],
  },
};
