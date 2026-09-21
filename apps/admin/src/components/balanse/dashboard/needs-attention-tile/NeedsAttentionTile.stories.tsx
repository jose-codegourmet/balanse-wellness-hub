import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NeedsAttentionTile } from "./NeedsAttentionTile";
import { needsAttentionTileDefaultValues } from "./NeedsAttentionTile.defaults";

const meta: Meta<typeof NeedsAttentionTile> = {
  title: "Admin/Components/NeedsAttentionTile",
  component: NeedsAttentionTile,
  tags: ["autodocs"],
  args: { ...needsAttentionTileDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllClear: Story = {
  args: {
    items: needsAttentionTileDefaultValues.items.map((item) => ({ ...item, count: 0 })),
  },
};
