import { publicCoaches } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";
import { CoachesPage } from "./CoachesPage";

const meta = {
  title: "Public/Coaches",
  component: CoachesPage,
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
} satisfies Meta<typeof CoachesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const YogaFilter: Story = {
  args: { initialSpecialty: "Yoga" },
};

export const FilterEmpty: Story = {
  args: { initialSpecialty: "Boxing" },
};

export const PlaceholderPhotos: Story = {
  args: {
    coaches: publicCoaches.filter((coach) =>
      ["Alec James Co", "Sofia Ocampo", "Kate Go"].includes(coach.name),
    ),
  },
};
