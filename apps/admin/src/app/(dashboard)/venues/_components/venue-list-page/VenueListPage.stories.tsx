import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VenueListPage } from "./VenueListPage";

const meta = {
  title: "Admin/Screens/Venues",
  component: VenueListPage,
  tags: ["autodocs"],
} satisfies Meta<typeof VenueListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Main studio, two off-site partners, and one inactive pop-up. */
export const AllVenues: Story = {};

export const Empty: Story = { args: { empty: true } };

export const AddVenueDialog: Story = { args: { previewCreate: true } };
