import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassCatalogueProvider } from "./ClassCatalogueProvider";
import { classCatalogueProviderDefaultValues } from "./ClassCatalogueProvider.defaults";

const meta = {
  title: "Admin/Components/Class catalogue provider",
  component: ClassCatalogueProvider,
  tags: ["autodocs"],
  args: { ...classCatalogueProviderDefaultValues },
} satisfies Meta<typeof ClassCatalogueProvider>;
export default meta;
export const Disconnected: StoryObj<typeof meta> = {
  args: { children: <p>Database catalogue requires verified admin access for saves.</p> },
};
