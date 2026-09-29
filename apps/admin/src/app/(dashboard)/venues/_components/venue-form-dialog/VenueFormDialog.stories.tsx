import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VenueFormDialog } from "./VenueFormDialog";
import { venueFormDefaultValues } from "./VenueFormDialog.defaults";
import { venueFormSchema } from "./VenueFormDialog.schema";

const meta = {
  title: "Admin/Screens/Venues/Venue form",
  component: VenueFormDialog,
  tags: ["autodocs"],
  parameters: { venueFormDefaultValues, venueFormSchema },
  args: { open: true, onOpenChange: () => {} },
} satisfies Meta<typeof VenueFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const EditOffsite: Story = {
  args: {
    venue: {
      id: "venue-mandani-bay",
      name: "Mandani Bay — Garden Area",
      address: "Mandani Bay, Mandaue City, Cebu",
      kind: "OFFSITE",
      active: true,
      notes: "Partner venue for outdoor events.",
    },
  },
};
