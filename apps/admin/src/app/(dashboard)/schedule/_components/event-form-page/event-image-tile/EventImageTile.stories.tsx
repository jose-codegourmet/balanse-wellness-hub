import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventImageTile } from "./EventImageTile";

const meta = {
  title: "Admin/Screens/Event form/Image tile",
  component: EventImageTile,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-44">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Add poster",
    value: "",
    src: null,
    aspect: "poster",
    onPick: () => {},
    onRemove: () => {},
  },
} satisfies Meta<typeof EventImageTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyPoster: Story = {};

export const WithImage: Story = {
  args: {
    value: "/assets/marketing/classes/dance-fitness-hero.webp",
    src: "/assets/marketing/classes/dance-fitness-hero.webp",
  },
};

export const PendingToken: Story = {
  args: { value: "pending:6f1c2b7e", src: null },
};

export const GallerySlot: Story = {
  args: { label: "Add image", aspect: "square" },
};
