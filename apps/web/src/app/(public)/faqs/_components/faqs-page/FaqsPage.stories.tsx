import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";
import { FaqsPage } from "./FaqsPage";

const meta = {
  title: "Public/FAQs",
  component: FaqsPage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <PublicHeader />
        <Story />
        <PublicFooter />
      </>
    ),
  ],
} satisfies Meta<typeof FaqsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchMatch: Story = {
  args: { initialQuery: "GCash" },
};

export const NoResults: Story = {
  args: { initialQuery: "xyz-no-match" },
};
