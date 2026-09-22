import { getMockAdapter } from "@balanse/mock";
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
  loaders: [async () => ({ bundles: await getMockAdapter().getPublicBundles() })],
  render: (_args, { loaded }) => <PackagesPage bundles={loaded.bundles} />,
};

export const Empty: Story = {
  args: { bundles: [] },
};
