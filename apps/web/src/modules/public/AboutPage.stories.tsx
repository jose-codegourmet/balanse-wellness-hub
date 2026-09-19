import { publicCoaches } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";
import { AboutPage } from "./AboutPage";

const meta = {
  title: "Public/About",
  component: AboutPage,
  args: { coaches: publicCoaches },
  decorators: [
    (Story) => (
      <>
        <PublicHeader />
        <Story />
        <PublicFooter />
      </>
    ),
  ],
} satisfies Meta<typeof AboutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
