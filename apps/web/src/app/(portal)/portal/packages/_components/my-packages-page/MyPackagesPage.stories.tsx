import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MyPackagesPage } from "./MyPackagesPage";

const meta = {
  title: "Customer/MyPackages",
  component: MyPackagesPage,
  tags: ["autodocs"],
} satisfies Meta<typeof MyPackagesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { entitlements: [], acquisitions: [], catalogue: [] },
};
