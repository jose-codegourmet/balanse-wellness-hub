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
        sessionCreditCount: 12,
        pricePhp: 0,
        applicabilityMode: "ALL_ACTIVE_CLASSES",
        classIds: [],
        validityDays: null,
        perCustomerLimit: 1,
        status: "PUBLISHED",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
        metrics: { granted: 0, held: 0, used: 0, restored: 0, owners: 0 },
      },
    ],
  },
};
