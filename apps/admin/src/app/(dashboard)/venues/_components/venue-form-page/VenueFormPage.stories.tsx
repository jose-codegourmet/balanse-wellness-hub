import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VenueFormPage } from "./VenueFormPage";
import { venueFormDefaultValues } from "./VenueFormPage.defaults";
import { venueFormSchema } from "./VenueFormPage.schema";

const meta = {
  title: "Admin/Screens/Venues/Venue form",
  component: VenueFormPage,
  tags: ["autodocs"],
  parameters: { venueFormDefaultValues, venueFormSchema },
  args: { venueId: "new" },
} satisfies Meta<typeof VenueFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const EditOffsite: Story = { args: { venueId: "venue-mandani-bay" } };

export const EditBranch: Story = { args: { venueId: "venue-main" } };

export const NotFound: Story = { args: { venueId: "venue-missing" } };

/** Empty required name — submit in the canvas to see the field error and summary. */
export const ValidationErrors: Story = { args: { venueId: "new" } };

export const Submitting: Story = {
  args: { venueId: "venue-mandani-bay" },
  parameters: { mockRuntime: { latencyMs: 10_000 } },
};

export const SubmitFailure: Story = {
  args: { venueId: "venue-mandani-bay" },
  parameters: { mockRuntime: { failNext: true } },
};
