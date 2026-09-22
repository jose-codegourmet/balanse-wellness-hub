import { getMockAdapter } from "@balanse/mock";
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
  loaders: [async () => ({ bundle: await getMockAdapter().getPublicBundle("newbie-package") })],
  render: (_args, { loaded }) => <PackageDetailPage bundle={loaded.bundle!} signedIn={false} />,
};
