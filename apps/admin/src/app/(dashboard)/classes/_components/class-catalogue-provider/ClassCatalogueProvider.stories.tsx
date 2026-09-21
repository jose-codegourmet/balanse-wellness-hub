import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassCatalogueProvider } from "./ClassCatalogueProvider";

const meta = {
  title: "Admin/Components/Class catalogue provider",
  component: ClassCatalogueProvider,
  tags: ["autodocs"],
  args: {
    initialData: { classes: [], coaches: [], canSave: false },
    load: async () => ({ classes: [], coaches: [], canSave: false }),
    save: async (input) => ({ ...input, id: input.id ?? "story-class" }),
    connect: async () => ({}),
  },
} satisfies Meta<typeof ClassCatalogueProvider>;
export default meta;
export const Disconnected: StoryObj<typeof meta> = {
  args: { children: <p>Database catalogue requires verified admin access for saves.</p> },
};
