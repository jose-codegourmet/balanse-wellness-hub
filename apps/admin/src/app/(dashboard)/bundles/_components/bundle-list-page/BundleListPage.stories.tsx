import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BundleListPage } from "./BundleListPage";

const meta = {
  title: "Admin/Screens/Bundles",
  component: BundleListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof BundleListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalogue: Story = {};
export const Empty: Story = { args: { empty: true } };
export const Loading: Story = { args: { loading: true } };
export const LoadFailed: Story = { args: { error: true } };
