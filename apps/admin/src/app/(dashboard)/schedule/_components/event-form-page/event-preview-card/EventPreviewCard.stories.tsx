import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventPreviewCard } from "./EventPreviewCard";

const meta = {
  title: "Admin/Screens/Event form/Preview card",
  component: EventPreviewCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "",
    summary: "",
    posterSrc: null,
    beneficiary: "",
    venueName: "",
    galleryCount: 0,
    session: null,
  },
} satisfies Meta<typeof EventPreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blank: Story = {};

export const Filled: Story = {
  args: {
    title: "Pilates for a Cause",
    summary: "One morning, one mat, one cause. All proceeds go to the shelter.",
    posterSrc: "/assets/marketing/classes/dance-fitness-hero.webp",
    beneficiary: "Cebu Animal Rescue",
    venueName: "Mandani Bay — Garden Area",
    galleryCount: 3,
    session: {
      className: "Pilates",
      startsAt: "2026-09-26T00:00:00Z",
      endsAt: "2026-09-26T01:30:00Z",
      capacity: 30,
      priceLabel: "₱1,000.00",
    },
  },
};
