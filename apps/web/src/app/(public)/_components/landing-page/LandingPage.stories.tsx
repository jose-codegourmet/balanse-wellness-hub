import { publicClasses, publicCoaches, publicSessions } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";
import { LandingPage } from "./LandingPage";

const meta = {
  title: "Public/Landing",
  component: LandingPage,
  tags: ["autodocs"],
  args: {
    coaches: publicCoaches,
    sessions: publicSessions,
    classes: publicClasses,
    loadError: false,
  },
  decorators: [
    (Story) => (
      <>
        <PublicHeader />
        <Story />
        <PublicFooter />
      </>
    ),
  ],
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CalendarLoadFailed: Story = {
  args: { loadError: true, sessions: [], classes: [] },
};
